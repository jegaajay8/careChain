require("dotenv").config();
const mysql = require("mysql2");

// Using a Pool is better for handling multiple donor/hospital requests at once
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Quick check to see if the pool can reach the database
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Database connected via Connection Pool");
        connection.release(); // Important: release the connection back to the pool
    }
});

module.exports = db.promise(); // Using .promise() allows you to use async/await later
