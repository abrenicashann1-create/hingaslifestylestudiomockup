<?php
/**
 * Hingas Lifestyle Studio — Database Connection Helper (PHP / WampServer)
 */

header('Content-Type: application/json; charset=utf-8');

$db_host = '127.0.0.1';
$db_port = '3306';
$db_name = 'hingas_studio';
$db_user = 'root';
$db_pass = ''; // Default WampServer password is blank

function getDbConnection() {
    global $db_host, $db_port, $db_name, $db_user, $db_pass;
    
    try {
        $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, $db_user, $db_pass, $options);
    } catch (PDOException $e) {
        return null;
    }
}
