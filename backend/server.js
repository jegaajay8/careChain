const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const morgan = require("morgan"); // For request logging
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "super_secure_carechain_key_2024";

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logs every request to the console for debugging

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

// --- 1. AUTHENTICATION & SECURITY ---

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) return res.status(401).json({ token: null, message: "Invalid Password!" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 }); // 24 hours

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    });
});

// --- 2. ADVANCED DONOR FEATURES ---

// NEW: Check Donor Eligibility (Has it been 3 months since last donation?)
app.get("/donor-eligibility/:user_id", verifyToken, (req, res) => {
    const sql = `
        SELECT last_donation_date, 
        DATEDIFF(CURDATE(), last_donation_date) as days_since 
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

// NEW: Donor Leaderboard (Gamification)
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

// --- 3. HOSPITAL & INVENTORY MANAGEMENT ---

// NEW: Update Hospital Blood Inventory
app.post("/update-inventory", verifyToken, (req, res) => {
    const { hospital_user_id, blood_group, units } = req.body;
    // This assumes you have an 'inventory' table: (hospital_id, blood_group, units)
    const sql = `
        INSERT INTO inventory (hospital_id, blood_group, units) 
        SELECT id, ?, ? FROM hospitals WHERE user_id = ?
        ON DUPLICATE KEY UPDATE units = units + VALUES(units)`;
    
    db.query(sql, [blood_group, units, hospital_user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Inventory update failed" });
        res.json({ message: "Inventory updated successfully" });
    });
});

// NEW: Get Emergency Requests (Priority filtered)
app.get("/emergency-requests", (req, res) => {
    const sql = `
        SELECT r.*, h.hospital_name, h.telephone 
        FROM requests r 
        JOIN hospitals h ON r.hospital_id = h.id 
        WHERE r.status = 'open' AND r.priority = 'high'
        ORDER BY r.created_at DESC`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// --- 4. ADMIN & ANALYTICS ---

// NEW: Global Stats for Landing Page
app.get("/system-stats", async (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM donors) as total_donors,
            (SELECT COUNT(*) FROM hospitals) as total_hospitals,
            (SELECT COUNT(*) FROM requests WHERE status='completed') as lives_saved
    `;
    db.query(statsQuery, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// NEW: Report Generator (JSON to CSV simulation)
app.get("/generate-report/:type", verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).send("Admin only");
    
    const type = req.params.type;
    let sql = "";
    if (type === "donations") sql = "SELECT * FROM requests WHERE status='completed'";
    else sql = "SELECT * FROM users";

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({
            report_generated_at: new Date(),
            data: result
        });
    });
});

// --- 5. LOGGING OUT & SESSION ---
app.post("/logout", (req, res) => {
    // In JWT, logout is usually handled on the client by deleting the token,
    // but we can acknowledge it here.
    res.status(200).json({ message: "Logged out successfully" });
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! Check the server logs.');
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 CARECHAIN SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`🔐 JWT SECURITY ENABLED`);
    console.log(`📊 ANALYTICS ENGINE STARTED`);
    console.log("========================================");
});