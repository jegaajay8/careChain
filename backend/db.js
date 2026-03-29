require("dotenv").config();
const mysql = require("mysql2");

//Create a env file and get connected with the Database.

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("Database error:", err);
    } else {
        console.log("Database connected");
    }
});

module.exports = db;