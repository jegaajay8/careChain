const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ==========================
   REGISTER DONOR
========================== */
app.post("/register-donor", (req, res) => {

    const { username, password, fullname, nic, telephone,
        blood_group, district, city, road, postal_code } = req.body;

    const sql1 = "INSERT INTO users (username, password, role) VALUES (?, ?, 'donor')";

    db.query(sql1, [username, password], (err, result) => {

        if (err) {
            res.json({ message: "User error" });
        } else {

            const user_id = result.insertId;

            const sql2 = "INSERT INTO donors (user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            db.query(sql2,
                [user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code],
                (err2) => {
                    if (err2) {
                        res.json({ message: "Donor error" });
                    } else {
                        res.json({ message: "Donor Registered" });
                    }
                });
        }
    });
});


/* ==========================
   REGISTER HOSPITAL
========================== */
app.post("/register-hospital", (req, res) => {

    const { username, password, hospital_name, hospital_id,
        district, city, road, postal_code } = req.body;

    const sql1 = "INSERT INTO users (username, password, role) VALUES (?, ?, 'hospital')";

    db.query(sql1, [username, password], (err, result) => {

        if (err) {
            res.json({ message: "User error" });
        } else {

            const user_id = result.insertId;

            const sql2 = "INSERT INTO hospitals (user_id, hospital_name, hospital_id, district, city, road, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?)";

            db.query(sql2,
                [user_id, hospital_name, hospital_id, district, city, road, postal_code],
                (err2) => {
                    if (err2) {
                        res.json({ message: "Hospital error" });
                    } else {
                        res.json({ message: "Hospital Registered" });
                    }
                });
        }
    });
});


/* ==========================
   LOGIN
========================== */
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username=? AND password=?";

    db.query(sql, [username, password], (err, result) => {

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json({ message: "Invalid login" });
        }
    });
});
