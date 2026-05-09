const mysql = require("mysql2");

class Database {
    constructor() {
        if (!Database.instance) {
            this.pool = mysql.createPool({
                host: "localhost",
                user: "root",
                password: "211204@La",
                database: "carechain",
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.error("❌ CareChain Database Error:", err.message);
                } else {
                    console.log("✅ CareChain Database connected via Singleton Connection Pool.");
                    connection.release();
                }
            });

            Database.instance = this;
        }
        return Database.instance;
    }

    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
