const mysql = require("mysql2");

// Create MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check Database Connection
db.getConnection((err, connection) => {

    if (err) {
        console.error("❌ Database connection failed:", err.message);
        return;
    }

    console.log("✅ Database connected successfully");

    // Release the connection back to pool
    connection.release();
});

// Export Promise-Based Pool
module.exports = db;