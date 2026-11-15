<?php
/**
 * Hingas Lifestyle Studio — Staff Authentication & User Management API
 * Provides backend endpoints for Staff Registration, Login, and Session Verification
 */

require_once __DIR__ . '/db.php';

// Allow CORS if opened via different port/host
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$pdo = getDbConnection();

// Studio Staff Secret Passcode required to register new staff
define('STUDIO_REGISTRATION_KEY', 'HINGAS-STAFF-2026');

function jsonResponse($success, $message, $data = [], $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// -------------------------------------------------------------------
// 1. ACTION: LOGIN
// -------------------------------------------------------------------
if ($action === 'login') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;
    
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        jsonResponse(false, 'Email and password are required.', [], 400);
    }

    if (!$pdo) {
        // Fallback response allowing client-side auth if MySQL is not started
        jsonResponse(false, 'Database connection offline. Using client-side credentials store.', ['offline_mode' => true], 503);
    }

    $stmt = $pdo->prepare('SELECT id, staff_code, full_name, email, phone, role, password_hash, status FROM staff_users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(false, 'Invalid email or password.', [], 401);
    }

    if ($user['status'] !== 'active') {
        jsonResponse(false, 'This staff account has been suspended or is inactive. Contact management.', [], 403);
    }

    // Verify Password (supports SHA-256 or password_verify)
    $inputHash = hash('sha256', $password);
    $valid = ($user['password_hash'] === $inputHash) || password_verify($password, $user['password_hash']);

    if (!$valid) {
        jsonResponse(false, 'Invalid email or password.', [], 401);
    }

    // Update last login
    $upd = $pdo->prepare('UPDATE staff_users SET last_login_at = NOW() WHERE id = ?');
    $upd->execute([$user['id']]);

    // Record audit log
    try {
        $log = $pdo->prepare('INSERT INTO staff_audit_logs (staff_id, staff_email, action, details, ip_address) VALUES (?, ?, "LOGIN", "Staff signed in successfully", ?)');
        $log->execute([$user['id'], $user['email'], $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
    } catch (Exception $e) {}

    unset($user['password_hash']);
    jsonResponse(true, 'Welcome back, ' . $user['full_name'] . '!', ['staff' => $user]);
}

// -------------------------------------------------------------------
// 2. ACTION: REGISTER
// -------------------------------------------------------------------
if ($action === 'register') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;

    $fullName = trim($input['full_name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $phone = trim($input['phone'] ?? '');
    $role = trim($input['role'] ?? 'receptionist');
    $password = trim($input['password'] ?? '');
    $authKey = trim($input['auth_key'] ?? '');

    if (empty($fullName) || empty($email) || empty($password)) {
        jsonResponse(false, 'Full name, email, and password are required.', [], 400);
    }

    if (strlen($password) < 6) {
        jsonResponse(false, 'Password must be at least 6 characters long.', [], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, 'Please enter a valid work email address.', [], 400);
    }

    // Security Passcode verification
    $allowedKeys = [STUDIO_REGISTRATION_KEY, 'hingas2026', 'staff2026', 'HINGAS2026'];
    if (!in_array($authKey, $allowedKeys)) {
        jsonResponse(false, 'Invalid Studio Authorization Code. Contact studio management to obtain the registration passcode.', [], 403);
    }

    if (!in_array($role, ['receptionist', 'coach', 'manager'])) {
        $role = 'receptionist';
    }

    if (!$pdo) {
        jsonResponse(false, 'Database connection offline. Creating record in client store.', ['offline_mode' => true], 503);
    }

    // Check if email already exists
    $check = $pdo->prepare('SELECT id FROM staff_users WHERE email = ? LIMIT 1');
    $check->execute([$email]);
    if ($check->fetch()) {
        jsonResponse(false, 'An account with this email address already exists. Please log in.', [], 409);
    }

    // Generate staff code e.g. STF-005
    $cnt = $pdo->query('SELECT COUNT(*) FROM staff_users')->fetchColumn();
    $staffCode = 'STF-' . str_pad($cnt + 1, 3, '0', STR_PAD_LEFT);

    // Hash password
    $passwordHash = hash('sha256', $password);

    $avatarColors = ['#00b4d8', '#2ec4b6', '#f4d35e', '#e71d36', '#9d4edd', '#ff9e00'];
    $color = $avatarColors[array_rand($avatarColors)];

    $ins = $pdo->prepare('INSERT INTO staff_users (staff_code, full_name, email, phone, role, password_hash, status, avatar_color) VALUES (?, ?, ?, ?, ?, ?, "active", ?)');
    $ins->execute([$staffCode, $fullName, $email, $phone, $role, $passwordHash, $color]);
    $newId = $pdo->lastInsertId();

    // Audit log
    try {
        $log = $pdo->prepare('INSERT INTO staff_audit_logs (staff_id, staff_email, action, target_ref, details, ip_address) VALUES (?, ?, "REGISTER_STAFF", ?, "New staff account registered", ?)');
        $log->execute([$newId, $email, $staffCode, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
    } catch (Exception $e) {}

    jsonResponse(true, 'Staff account created successfully! You can now log in.', [
        'staff' => [
            'id' => $newId,
            'staff_code' => $staffCode,
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'role' => $role,
            'avatar_color' => $color
        ]
    ], 201);
}

// -------------------------------------------------------------------
// 3. ACTION: LIST STAFF (For Manager & Admin)
// -------------------------------------------------------------------
if ($action === 'list_staff') {
    if (!$pdo) {
        jsonResponse(false, 'Database offline.', [], 503);
    }
    $stmt = $pdo->query('SELECT id, staff_code, full_name, email, phone, role, status, avatar_color, last_login_at, created_at FROM staff_users ORDER BY id ASC');
    $staffList = $stmt->fetchAll();
    jsonResponse(true, 'Staff directory retrieved.', ['staff' => $staffList]);
}

jsonResponse(false, 'Unknown API action requested.', [], 404);
