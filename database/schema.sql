CREATE DATABASE IF NOT EXISTS carechain;
USE carechain;

-- 1. Users Table (The base for everyone)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, -- Prevents duplicate usernames
    password VARCHAR(255) NOT NULL,       -- Increased length for potential hashing
    role ENUM('donor', 'hospital', 'admin') NOT NULL -- Limits roles to specific values
);

-- 2. Donors Table
CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    nic VARCHAR(20) UNIQUE NOT NULL,      -- Every citizen has a unique NIC
    telephone VARCHAR(20),
    blood_group VARCHAR(5),
    district VARCHAR(50),
    city VARCHAR(50),
    road VARCHAR(100),
    postal_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Hospitals Table
CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hospital_name VARCHAR(100) NOT NULL,
    hospital_id VARCHAR(50) UNIQUE NOT NULL, -- Official Hospital Registration ID
    district VARCHAR(50),
    city VARCHAR(50),
    road VARCHAR(100),
    postal_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Patients Table (Linked to a Hospital)
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    nic VARCHAR(20),
    blood_group VARCHAR(5),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- 5. Requests Table
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    district VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    accepted_donor_id INT NULL, -- Starts as NULL until someone accepts
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (accepted_donor_id) REFERENCES donors(id) ON DELETE SET NULL
);