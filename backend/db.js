const mysql = require("mysql2");

// Using a Pool instead of a single connection for better stability
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "211204@La",
    database: "carechain",
    waitForConnections: true,
    connectionLimit: 10, // Allows up to 10 simultaneous connections
    queueLimit: 0
});

// Test the pool connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ CareChain Database Error:", err.message);
    } else {
        console.log("✅ CareChain Database connected via Connection Pool.");
        connection.release(); // Return the connection to the pool
    }
});

module.exports = db;