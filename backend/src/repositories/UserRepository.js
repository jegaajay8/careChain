const BaseRepository = require("./BaseRepository");

class UserRepository extends BaseRepository {
    async findByUsernameAndPassword(username, password) {
        const sql = "SELECT id, username, role FROM users WHERE username=? AND password=?";
        const results = await this.query(sql, [username, password]);
        return results[0];
    }

    async createUser(username, password, role) {
        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        const result = await this.query(sql, [username, password, role]);
        return result.insertId;
    }

    async getMasterHospitals() {
        const sql = "SELECT * FROM master_hospitals ORDER BY district, name ASC";
        return await this.query(sql);
    }
}

module.exports = new UserRepository();
