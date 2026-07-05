const BaseRepository = require("./BaseRepository");

class HospitalRepository extends BaseRepository {
    async createProfile(profileData) {
        const { user_id, rep_name, hospital_name, hospital_id, district, lat, lng } = profileData;
        const sql = "INSERT INTO hospitals (user_id, rep_name, hospital_name, hospital_id, district, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [user_id, rep_name, hospital_name, hospital_id, district, parseFloat(lat), parseFloat(lng)];
        return await this.query(sql, values);
    }

    async findAllLocations() {
        const sql = `
            SELECT h.id, h.hospital_name, h.district, h.lat, h.lng,
            (SELECT COUNT(*) FROM requests r WHERE r.hospital_id = h.id AND r.status = 'open') as urgent_count
            FROM hospitals h`;
        return await this.query(sql);
    }

    async findByUserId(user_id) {
        const sql = "SELECT id FROM hospitals WHERE user_id = ?";
        const results = await this.query(sql, [user_id]);
        return results[0];
    }
}

module.exports = new HospitalRepository();
