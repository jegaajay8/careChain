const db = require("./Database");

class DatabaseProxy {
    constructor() {
        this.db = db;
    }

    async query(sql, params) {
        const start = Date.now();
        try {
            const results = await this.db.query(sql, params);
            const duration = Date.now() - start;
            console.log(`[DatabaseProxy] Query executed in ${duration}ms: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
            return results;
        } catch (err) {
            console.error(`[DatabaseProxy] Query failed: ${sql}`);
            throw err;
        }
    }
}

module.exports = new DatabaseProxy();
