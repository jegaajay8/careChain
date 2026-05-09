const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "super_secure_carechain_key_2024";

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Custom Middleware to protect routes
const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided!" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized!" });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// --- 1. AUTHENTICATION ---

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ message: "Invalid Password!" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    });
});

// --- 2. DONOR FEATURES & GAMIFICATION ---

app.get("/donor-eligibility/:user_id", verifyToken, (req, res) => {
    const sql = `
        SELECT last_donation_date, DATEDIFF(CURDATE(), last_donation_date) as days_since 
        FROM donors WHERE user_id = ?`;
    
    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send("Donor not found");

        const days = result[0].days_since;
        const eligible = days === null || days >= 90;
        res.json({
            eligible: eligible,
            days_remaining: eligible ? 0 : 90 - days,
            message: eligible ? "You are ready to save a life!" : `Please wait ${90 - days} more days.`
        });
    });
});

app.get("/leaderboard", (req, res) => {
    const sql = `
        SELECT d.fullname, COUNT(r.id) as donation_count 
        FROM donors d
        JOIN requests r ON d.id = r.accepted_donor_id
        WHERE r.status = 'completed'
        GROUP BY d.id
        ORDER BY donation_count DESC LIMIT 10`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// --- 3. PROXIMITY & SEARCH ---

app.get("/nearby-donors", verifyToken, (req, res) => {
    const { lat, lng, radius, blood_group } = req.query; 
    const sql = `
        SELECT fullname, blood_group, latitude, longitude,
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
        FROM donors WHERE blood_group = ?
        HAVING distance < ? ORDER BY distance ASC`;

    db.query(sql, [lat, lng, lat, blood_group, radius || 50], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// --- 4. HOSPITAL & APPOINTMENTS ---

app.post("/update-inventory", verifyToken, (req, res) => {
    const { hospital_user_id, blood_group, units } = req.body;
    const sql = `
        INSERT INTO inventory (hospital_id, blood_group, units) 
        SELECT id, ?, ? FROM hospitals WHERE user_id = ?
        ON DUPLICATE KEY UPDATE units = units + VALUES(units)`;
    
    db.query(sql, [blood_group, units, hospital_user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Inventory update failed" });
        res.json({ message: "Inventory updated successfully" });
    });
});

app.post("/schedule-appointment", verifyToken, (req, res) => {
    const { hospital_id, appointment_date, time_slot } = req.body;
    const checkSql = "SELECT * FROM appointments WHERE hospital_id = ? AND appointment_date = ? AND time_slot = ?";
    
    db.query(checkSql, [hospital_id, appointment_date, time_slot], (err, result) => {
        if (result.length > 0) return res.status(400).json({ message: "Time slot taken." });

        const sql = "INSERT INTO appointments (donor_user_id, hospital_id, appointment_date, time_slot, status) VALUES (?, ?, ?, ?, 'scheduled')";
        db.query(sql, [req.userId, hospital_id, appointment_date, time_slot], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Appointment booked!", appointmentId: result.insertId });
        });
    });
});

// --- 5. EMERGENCY BROADCASTS & NOTIFICATIONS ---

app.post("/broadcast-emergency", verifyToken, (req, res) => {
    if (req.userRole !== 'hospital') return res.status(403).send("Unauthorized");
    const { blood_group, message } = req.body;

    db.query("SELECT user_id FROM donors WHERE blood_group = ?", [blood_group], (err, donors) => {
        if (err || donors.length === 0) return res.status(500).json({ message: "No donors found" });

        const notifications = donors.map(d => [d.user_id, message, 'unread', new Date()]);
        db.query("INSERT INTO notifications (user_id, message, status, created_at) VALUES ?", [notifications], (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: `Alert sent to ${result.affectedRows} donors.` });
        });
    });
});

app.get("/my-notifications", verifyToken, (req, res) => {
    db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// --- 6. ADMIN & ANALYTICS ---

app.get("/system-stats", (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM donors) as total_donors,
            (SELECT COUNT(*) FROM hospitals) as total_hospitals,
            (SELECT COUNT(*) FROM requests WHERE status='completed') as lives_saved`;
    db.query(statsQuery, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

app.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

// --- ERROR HANDLING & START ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

app.listen(PORT, () => {
    console.log(`🚀 CARECHAIN SERVER ACTIVE ON PORT ${PORT}`);
});