//importing modules
const express = require("express");   // frame work to create server and API
const cors = require("cors");     //allows frontend to access backend 
const db = require("./db");      // my sql connection file
const bcrypt = require("bcrypt");
require("dotenv").config();

// Ensure db.js uses your password

// create app
const app = express();

// (frontend <-> backend)
app.use(cors());
app.use(express.json());


// 1. AUTHENTICATION & LOGIN

// login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }
    
    const sql = "SELECT * FROM users WHERE username=?";
    
    //SQL query to check user
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length > 0) {
            const user = result[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json({ id: user.id, username: user.username, role: user.role });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});


// 2. DONOR ROUTES


// Register Donor
app.post("/register-donor", async (req, res) => {
    const { username, password, fullname, nic, telephone, blood_group, district, city, road, postal_code } = req.body;
    
    if (!username || !password || !fullname) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const sql1 = "INSERT INTO users (username, password, role) VALUES (?, ?, 'donor')";

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(sql1, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Username already exists." });
        const user_id = result.insertId;
        const sql2 = "INSERT INTO donors (user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sql2, [user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code], (err2) => {
            if (err2) return res.status(500).json({ message: "Error saving donor details." });
            res.status(200).json({ message: "Donor Registered Successfully!" });
        });
    });
});

// Get Donor Profile
app.get("/donor-profile/:user_id", (req, res) => {
    const sql = "SELECT * FROM donors WHERE user_id = ?";
    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// Get Requests matching Donor's Blood and District
app.get("/get-requests/:user_id", (req, res) => {
    const sqlDonor = "SELECT blood_group, district FROM donors WHERE user_id = ?";
    db.query(sqlDonor, [req.params.user_id], (err, donor) => {
        if (err || donor.length === 0) return res.status(404).send("Donor not found");
        const sqlReq = `
            SELECT r.*, h.hospital_name 
            FROM requests r 
            JOIN hospitals h ON r.hospital_id = h.id 
            WHERE r.status = 'open' AND r.blood_group = ? AND r.district = ?`;
        db.query(sqlReq, [donor[0].blood_group, donor[0].district], (err2, requests) => {
            res.json(requests);
        });
    });
});

// Donor Accepts a Request
app.post("/accept-request", (req, res) => {
    const { request_id, donor_user_id } = req.body;
    db.query("SELECT id FROM donors WHERE user_id = ?", [donor_user_id], (err, donor) => {
        if (err || donor.length === 0) return res.status(404).json({ message: "Donor not found" });
        const sql = "UPDATE requests SET status='closed', accepted_donor_id=? WHERE id=? AND status='open'";
        db.query(sql, [donor[0].id, request_id], (err2, result) => {
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Request already taken" });
            }
            if (err2) return res.status(500).json({ message: "Error updating request" });
            res.json({ message: "Request Accepted!" });
        });
    });
});

// Register Hospital
app.post("/register-hospital", (req, res) => {
    const { username, password, hospital_name, hospital_id, district, city, road, postal_code } = req.body;
    const sql1 = "INSERT INTO users (username, password, role) VALUES (?, ?, 'hospital')";
    db.query(sql1, [username, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Username already exists." });
        const user_id = result.insertId;
        const sql2 = "INSERT INTO hospitals (user_id, hospital_name, hospital_id, district, city, road, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql2, [user_id, hospital_name, hospital_id, district, city, road, postal_code], (err2) => {
            if (err2) return res.status(500).json({ message: "Error saving hospital details." });
            res.status(200).json({ message: "Hospital Registered Successfully!" });
        });
    });
});


// Add Patient (linked to hospital table PK)
app.post("/add-patient", (req, res) => {
    const { hospital_user_id, fullname, nic, blood_group } = req.body;
    db.query("SELECT id FROM hospitals WHERE user_id=?", [hospital_user_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Hospital not found" });
        const hospital_id = result[0].id;
        const sql = "INSERT INTO patients (hospital_id, fullname, nic, blood_group) VALUES (?, ?, ?, ?)";
        db.query(sql, [hospital_id, fullname, nic, blood_group], (err2) => {
            if (err2) return res.status(500).json({ message: "Error adding patient" });
            res.json({ message: "Patient Added" });
        });
    });
});

// View Patients
app.get("/get-patients/:user_id", (req, res) => {
    const sql = "SELECT p.* FROM patients p JOIN hospitals h ON p.hospital_id = h.id WHERE h.user_id = ?";
    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Send Blood Request
app.post("/send-request", (req, res) => {
    const { hospital_user_id, blood_group, district } = req.body;
    db.query("SELECT id FROM hospitals WHERE user_id=?", [hospital_user_id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Hospital not found" });
        const hospital_id = result[0].id;
        const sql = "INSERT INTO requests (hospital_id, blood_group, district, status) VALUES (?, ?, ?, 'open')";
        db.query(sql, [hospital_id, blood_group, district], (err2) => {
            if (err2) return res.status(500).json({ message: "Failed to post request" });
            res.json({ message: "Request Broadcasted Successfully" });
        });
    });
});

// View Accepted Donors for Hospital
app.get("/accepted-donors/:hospital_user_id", (req, res) => {
    const sql = `
        SELECT r.id as request_id, d.fullname, d.telephone, r.blood_group, d.id as donor_id 
        FROM requests r 
        JOIN donors d ON r.accepted_donor_id = d.id 
        JOIN hospitals h ON r.hospital_id = h.id 
        WHERE h.user_id = ? AND r.status = 'closed'`;
    db.query(sql, [req.params.hospital_user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Archive/Complete Request
app.post("/complete-request", (req, res) => {
    const { request_id } = req.body;
    db.query("UPDATE requests SET status='completed' WHERE id=?", [request_id], (err) => {
        if (err) return res.status(500).json({ message: "Error completing request" });
        res.json({ message: "Donation archived." });
    });
});

// --- SERVER START ---
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ CareChain Server running on Port ${PORT}`);
    console.log(`🔗 Database connected and ready.`);
});


