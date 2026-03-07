CREATE DATABASE carechain;

USE carechain;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50),
    role VARCHAR(20)
);

CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    fullname VARCHAR(100),
    nic VARCHAR(20),
    telephone VARCHAR(20),
    blood_group VARCHAR(5),
    district VARCHAR(50),
    city VARCHAR(50),
    road VARCHAR(100),
    postal_code VARCHAR(20)
);

CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    hospital_name VARCHAR(100),
    hospital_id VARCHAR(50),
    district VARCHAR(50),
    city VARCHAR(50),
    road VARCHAR(100),
    postal_code VARCHAR(20)
);

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT,
    fullname VARCHAR(100),
    nic VARCHAR(20),
    blood_group VARCHAR(5)
);

CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT,
    blood_group VARCHAR(5),
    district VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    accepted_donor_id INT
);