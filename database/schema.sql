CREATE DATABASE IF NOT EXISTS carechain;
USE carechain;

-- A. Master Hospitals List
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
