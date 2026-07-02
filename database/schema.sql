CREATE DATABASE IF NOT EXISTS carechain;
USE carechain;

-- 1. TABLES

--A. Master Hospitals List
CREATE TABLE IF NOT EXISTS master_hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    official_id VARCHAR(50) NOT NULL UNIQUE,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL
);

-- B. Users Table (Core Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'hospital', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    nic VARCHAR(20) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    blood_group VARCHAR(5),
    district VARCHAR(50),
    city VARCHAR(50),
    road VARCHAR(100),
    postal_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- D. Hospitals Table (Profile)
CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rep_name VARCHAR(100) NOT NULL, 
    hospital_name VARCHAR(100) NOT NULL,
    hospital_id VARCHAR(50) NOT NULL, 
    district VARCHAR(50) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL, 
    lng DECIMAL(11, 8) NOT NULL,
    city VARCHAR(50) NULL,       
    road VARCHAR(100) NULL,      
    postal_code VARCHAR(20) NULL, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- E. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    nic VARCHAR(20),
    blood_group VARCHAR(5),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- F. Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    district VARCHAR(50) NOT NULL,
    status ENUM('open', 'accepted', 'closed') DEFAULT 'open',
    accepted_donor_id INT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (accepted_donor_id) REFERENCES donors(id) ON DELETE SET NULL
);


-- 2. MASTER DATA SEEDING

INSERT INTO master_hospitals (name, district, official_id, lat, lng) VALUES 
('National Hospital of Sri Lanka', 'Colombo', 'COL-NHSL-001', 6.9271, 79.8612),
('Colombo South Teaching Hospital', 'Colombo', 'COL-CSTH-002', 6.8525, 79.8637),
('Colombo North Teaching Hospital (Ragama)', 'Gampaha', 'GAM-CNTH-003', 7.0278, 79.9234),
('Lady Ridgeway Hospital (Children)', 'Colombo', 'COL-LRH-004', 6.9221, 79.8732),
('Apeksha Hospital (Cancer)', 'Colombo', 'COL-AKH-005', 6.8483, 79.9265),
('Sri Jayewardenepura General Hospital', 'Colombo', 'COL-SJGH-006', 6.9015, 79.9220),
('Base Hospital Panadura', 'Kalutara', 'KAL-BH-007', 6.7111, 79.9075),
('Teaching Hospital Jaffna', 'Jaffna', 'JAF-TH-008', 9.6615, 80.0255),
('District General Hospital Kilinochchi', 'Kilinochchi', 'KIL-DGH-009', 9.3833, 80.4000),
('District General Hospital Vavuniya', 'Vavuniya', 'VAV-DGH-010', 8.7514, 80.4975),
('Base Hospital Point Pedro', 'Jaffna', 'JAF-BH-011', 9.8247, 80.2350),
('Base Hospital Mullaitivu', 'Mullaitivu', 'MUL-BH-012', 9.2667, 80.8167),
('National Hospital Kandy', 'Kandy', 'KAN-NHK-013', 7.2911, 80.6324),
('Teaching Hospital Peradeniya', 'Kandy', 'KAN-THP-014', 7.2655, 80.5985),
('District General Hospital Matale', 'Matale', 'MAT-DGH-015', 7.4722, 80.6236),
('District General Hospital Nuwara Eliya', 'Nuwara Eliya', 'NUE-DGH-016', 6.9722, 80.7653),
('Teaching Hospital Karapitiya', 'Galle', 'GAL-THK-017', 6.0667, 80.2333),
('District General Hospital Matara', 'Matara', 'MTR-DGH-018', 5.9500, 80.5333),
('District General Hospital Hambantota', 'Hambantota', 'HAM-DGH-019', 6.1246, 81.1245),
('Teaching Hospital Anuradhapura', 'Anuradhapura', 'ANU-THA-020', 8.3444, 80.4108),
('District General Hospital Polonnaruwa', 'Polonnaruwa', 'POL-DGH-021', 7.9333, 81.0000),
('Teaching Hospital Batticaloa', 'Batticaloa', 'BAT-THB-022', 7.7167, 81.7000),
('District General Hospital Trincomalee', 'Trincomalee', 'TRI-DGH-023', 8.5750, 81.2333),
('Teaching Hospital Kurunegala', 'Kurunegala', 'KUR-THK-024', 7.4833, 80.3667),
('District General Hospital Chilaw', 'Puttalam', 'PUT-DGH-025', 7.5833, 79.7953),
('Provincial General Hospital Badulla', 'Badulla', 'BAD-PGH-026', 6.9884, 81.0565),
('Teaching Hospital Ratnapura', 'Ratnapura', 'RAT-THR-027', 6.6828, 80.3992),
('District General Hospital Kegalle', 'Kegalle', 'KEG-DGH-028', 7.2522, 80.3444);