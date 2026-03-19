const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


//REGISTER DONOR

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


//REGISTER HOSPITAL

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

//LOGIN

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

//DELETE DONOR ACCOUNT

app.post("/delete-donor-account", (req, res) => {

    const { user_id } = req.body;

    // First get donor id
    db.query("SELECT id FROM donors WHERE user_id=?", [user_id], (err, result) => {

        if (result.length === 0) {
            return res.json({ message: "Donor not found" });
        }

        const donor_id = result[0].id;

        // Delete requests where donor accepted
        db.query("DELETE FROM requests WHERE accepted_donor_id=?", [donor_id], () => {

            // Delete from donors table
            db.query("DELETE FROM donors WHERE user_id=?", [user_id], () => {

                // Delete from users table
                db.query("DELETE FROM users WHERE id=?", [user_id], () => {

                    res.json({ message: "Account Deleted" });

                });

            });

        });

    });
});

//GET DONOR DETAILS

app.get("/donor-details/:donor_id", (req, res) => {

    const donor_id = req.params.donor_id;

    db.query("SELECT * FROM donors WHERE id=?", [donor_id], (err, result) => {

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json({});
        }

    });
});

//ADD PATIENT

app.post("/add-patient", (req, res) => {

    const { hospital_user_id, fullname, nic, blood_group } = req.body;

    const findHospital = "SELECT id FROM hospitals WHERE user_id=?";

    db.query(findHospital, [hospital_user_id], (err, result) => {

        const hospital_id = result[0].id;

        const sql = "INSERT INTO patients (hospital_id, fullname, nic, blood_group) VALUES (?, ?, ?, ?)";

        db.query(sql, [hospital_id, fullname, nic, blood_group], () => {
            res.json({ message: "Patient added" });
        });
    });
});


// SEND REQUEST

app.post("/send-request", (req, res) => {

    const { hospital_user_id, blood_group, district } = req.body;

    const findHospital = "SELECT id FROM hospitals WHERE user_id=?";

    db.query(findHospital, [hospital_user_id], (err, result) => {

        const hospital_id = result[0].id;

        const sql = "INSERT INTO requests (hospital_id, blood_group, district, status) VALUES (?, ?, ?, 'open')";

        db.query(sql, [hospital_id, blood_group, district], () => {
            res.json({ message: "Request sent" });
        });
    });
});

// DONOR PROFILE

app.get("/donor-profile/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const sql = "SELECT * FROM donors WHERE user_id=?";

    db.query(sql, [user_id], (err, result) => {
        res.json(result[0]);
    });
});

//GET REQUESTS FOR DONOR

app.get("/get-requests/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const donorSql = "SELECT * FROM donors WHERE user_id=?";

    db.query(donorSql, [user_id], (err, donorResult) => {

        const donor = donorResult[0];

        const requestSql = `
            SELECT r.*, h.hospital_name
            FROM requests r
            JOIN hospitals h ON r.hospital_id = h.id
            WHERE r.blood_group=? 
            AND r.district=? 
            AND r.status='open'
        `;

        db.query(requestSql,
            [donor.blood_group, donor.district],
            (err2, requests) => {
                res.json(requests);
            });
    });
});

//ACCEPT  REQUEST

app.post("/accept-request", (req, res) => {

    const { request_id, donor_user_id } = req.body;

    const findDonor = "SELECT id FROM donors WHERE user_id=?";

    db.query(findDonor, [donor_user_id], (err, result) => {

        const donor_id = result[0].id;

        const sql = "UPDATE requests SET status='closed', accepted_donor_id=? WHERE id=?";

        db.query(sql, [donor_id, request_id], () => {
            res.json({ message: "Accepted" });
        });
    });
});


//GET ACCEPTED DONORS

app.get("/accepted-donors/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const findHospital = "SELECT id FROM hospitals WHERE user_id=?";

    db.query(findHospital, [user_id], (err, result) => {

        const hospital_id = result[0].id;

        const sql = `
        SELECT r.id as request_id, d.id as donor_id, d.fullname, d.telephone, d.blood_group
        FROM requests r
        JOIN donors d ON r.accepted_donor_id = d.id
        WHERE r.hospital_id=? AND r.status='closed'
        `;

        db.query(sql, [hospital_id], (err2, donors) => {
            res.json(donors);
        });
    });
});