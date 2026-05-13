const BaseRepository = require("./BaseRepository");

class DonorRepository extends BaseRepository {
    async createProfile(profileData) {
        const { user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code } = profileData;
        const sql = "INSERT INTO donors (user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [user_id, fullname, nic, telephone, blood_group, district, city, road, postal_code];
        return await this.query(sql, values);
    }

    async findProfileByUserId(user_id) {
        const sql = "SELECT * FROM donors WHERE user_id = ?";
        const results = await this.query(sql, [user_id]);
        return results[0];
    }

    async findIdByUserId(user_id) {
        const sql = "SELECT id FROM donors WHERE user_id = ?";
        const results = await this.query(sql, [user_id]);
        return results[0];
    }
}

module.exports = new DonorRepository();
