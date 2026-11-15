-- ===================================================================
-- Hingas Lifestyle Studio — Complete Relational Database Schema
-- Studio Management, Customer Bookings, Sessions & Staff Database
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10+ (WampServer)
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `hingas_studio`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `hingas_studio`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------
-- 1. Table: `staff_users`
-- Front-desk receptionists, instructors/coaches, and studio managers
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `staff_users`;
CREATE TABLE `staff_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `staff_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique staff ID e.g. STF-001',
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `role` ENUM('manager', 'receptionist', 'coach') NOT NULL DEFAULT 'receptionist',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Secure password hash (SHA-256 or bcrypt)',
  `salt` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `avatar_color` VARCHAR(20) DEFAULT '#00b4d8',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_staff_email` (`email`),
  INDEX `idx_staff_role` (`role`),
  INDEX `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 2. Table: `classes`
-- Dance, fitness, gymnastics, and movement class catalog
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Short identifier e.g. zumba-fitness',
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Dance & Fitness',
  `default_coach` VARCHAR(100) NOT NULL,
  `room` VARCHAR(50) NOT NULL DEFAULT 'Main Studio',
  `duration_min` SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  `capacity` SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  `price_dropin` DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  `color_accent` VARCHAR(20) NOT NULL DEFAULT '#00b4d8',
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 3. Table: `sessions_schedule`
-- Specific scheduled class time-slots
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `sessions_schedule`;
CREATE TABLE `sessions_schedule` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'Unique session key e.g. sess-2026-11-14-zumba-1',
  `class_id` INT UNSIGNED NOT NULL,
  `class_name` VARCHAR(100) NOT NULL,
  `session_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `coach` VARCHAR(100) NOT NULL,
  `room` VARCHAR(50) NOT NULL DEFAULT 'Main Studio',
  `slots_total` SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  `slots_booked` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('open', 'full', 'cancelled', 'completed') NOT NULL DEFAULT 'open',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  INDEX `idx_session_date` (`session_date`),
  INDEX `idx_session_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 4. Table: `bookings`
-- Customer session bookings, attendee passes & check-in records
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_ref` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Customer reference code e.g. HG-7A9B1C',
  `session_id` VARCHAR(64) NOT NULL,
  `class_name` VARCHAR(100) NOT NULL,
  `booking_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `room` VARCHAR(50) NOT NULL DEFAULT 'Main Studio',
  `coach` VARCHAR(100) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_mobile` VARCHAR(30) NOT NULL,
  `customer_email` VARCHAR(100) NOT NULL,
  `attendee_names` TEXT DEFAULT NULL COMMENT 'Comma-separated attendee names for multi-seat bookings',
  `seats` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'GCash Direct',
  `payment_ref` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('paid', 'checked-in', 'held', 'cancelled', 'refunded') NOT NULL DEFAULT 'paid',
  `checked_in_at` DATETIME DEFAULT NULL,
  `checked_in_by` VARCHAR(100) DEFAULT NULL COMMENT 'Staff member who checked this ticket in',
  `is_walkin` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_booking_ref` (`booking_ref`),
  INDEX `idx_booking_date` (`booking_date`),
  INDEX `idx_booking_session` (`session_id`),
  INDEX `idx_booking_status` (`status`),
  INDEX `idx_customer_email` (`customer_email`),
  INDEX `idx_customer_mobile` (`customer_mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 5. Table: `rental_inquiries`
-- Studio space rental, private rehearsals, and monthly package requests
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `rental_inquiries`;
CREATE TABLE `rental_inquiries` (
  `id` VARCHAR(30) NOT NULL PRIMARY KEY COMMENT 'Reference code e.g. REQ-01',
  `type` VARCHAR(50) NOT NULL DEFAULT 'Studio Rental',
  `room` VARCHAR(50) NOT NULL DEFAULT 'Main Studio',
  `applicant_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `requested_date` DATE NOT NULL,
  `requested_time` VARCHAR(50) NOT NULL,
  `group_size` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `purpose` TEXT DEFAULT NULL,
  `status` ENUM('Pending', 'Contacted', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  `admin_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rental_status` (`status`),
  INDEX `idx_rental_date` (`requested_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 6. Table: `staff_audit_logs`
-- Audit trail of security, check-ins, walk-ins, and modifications
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `staff_audit_logs`;
CREATE TABLE `staff_audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `staff_id` INT UNSIGNED DEFAULT NULL,
  `staff_email` VARCHAR(100) NOT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'e.g. LOGIN, CHECKIN, WALKIN, REGISTER_STAFF',
  `target_ref` VARCHAR(50) DEFAULT NULL COMMENT 'e.g. HG-7A9B1C or STF-003',
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `staff_users`(`id`) ON DELETE SET NULL,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- INITIAL SEED DATA
-- Default staff accounts, class catalog, and sample bookings
-- ===================================================================

-- Staff Accounts
-- Passwords:
--   frontdesk@hingas.ph -> staff2026
--   manager@hingas.ph   -> hingas2026
--   coach.alex@hingas.ph -> coach2026
--   coach.zin@hingas.ph  -> zin2026
INSERT INTO `staff_users` (`staff_code`, `full_name`, `email`, `phone`, `role`, `password_hash`, `status`, `avatar_color`) VALUES
('STF-001', 'Hingas Front Desk', 'frontdesk@hingas.ph', '0917 555 0101', 'receptionist', '950269f884218dc3398403d526fc18e6924376c965cbeecf97bb32be783da342', 'active', '#00b4d8'),
('STF-002', 'Studio Manager (Elena Rost)', 'manager@hingas.ph', '0917 555 0102', 'manager', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'active', '#f4d35e'),
('STF-003', 'Coach Alex Bea', 'coach.alex@hingas.ph', '0917 555 0103', 'coach', 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', 'active', '#2ec4b6'),
('STF-004', 'Coach Zin Perez', 'coach.zin@hingas.ph', '0917 555 0104', 'coach', 'b7d8d26859842aef279a37e504c356fc8325a7229cc4a1bc19e5987c10b74549', 'active', '#e71d36');

-- Class Catalog
INSERT INTO `classes` (`code`, `name`, `category`, `default_coach`, `room`, `duration_min`, `capacity`, `price_dropin`, `color_accent`, `description`) VALUES
('zumba-fitness', 'Zumba Fitness Party', 'Dance & Cardio', 'Coach Zin', 'Main Studio', 60, 25, 200.00, '#00b4d8', 'High-energy Latin and world music cardio dance workout suitable for all fitness levels.'),
('gentle-yoga', 'Gentle Stretch & Mobility Yoga', 'Mind & Body', 'Coach Bea', 'Aqua Room', 60, 15, 200.00, '#2ec4b6', 'Calming breathwork, mindful stretching, and joint mobility to reset your body and mind.'),
('gymnastics-tumbling', 'Gymnastics & Tumbling', 'Strength & Acrobatics', 'Coach Dex', 'Main Studio', 90, 15, 300.00, '#f4d35e', 'Floor gymnastics, basic tumbling, flexibility drills, and safe progression for youth & adults.'),
('basic-ballet', 'Basic Ballet & Posture', 'Classical Dance', 'Coach Anya', 'Aqua Room', 60, 12, 250.00, '#e71d36', 'Classical ballet fundamentals, barre work, elegant posture alignment, and graceful footwork.'),
('femme-choreography', 'Femme Dance Choreography', 'Urban Dance', 'Coach Rox', 'Main Studio', 75, 20, 250.00, '#9d4edd', 'Confident heels and street-jazz choreography focusing on musicality, stage presence, and flow.'),
('step-hype', 'Step Hype Aerobics', 'Cardio Conditioning', 'Coach Ken', 'Main Studio', 60, 20, 200.00, '#ff9e00', 'Upbeat step-platform aerobics with rhythmic combinations and calorie-burning beats.');

-- Sample Inquiries
INSERT INTO `rental_inquiries` (`id`, `type`, `room`, `applicant_name`, `phone`, `email`, `requested_date`, `requested_time`, `group_size`, `purpose`, `status`) VALUES
('REQ-01', 'Studio Rental', 'Aqua Room', 'Surigao Dance Troupe', '0917 888 3322', 'dance@surigao.ph', CURDATE(), '20:30 - 22:30', 16, 'Rehearsal for City Fiesta Dance Competition', 'Pending'),
('REQ-02', 'Monthly Package', 'Main Studio', 'Kenneth Gomez', '0922 444 9911', 'kenneth.g@gmail.com', CURDATE(), 'Flexible', 1, 'Inquiring about 12-session Unlimited Zumba & Yoga package', 'Contacted');
