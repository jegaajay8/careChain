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
