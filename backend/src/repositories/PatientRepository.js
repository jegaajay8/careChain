const BaseRepository = require("./BaseRepository");

class PatientRepository extends BaseRepository {
    async findByHospitalUser(user_id) {
        const sql = `
            SELECT p.* FROM patients p 
            JOIN hospitals h ON p.hospital_id = h.id 
            WHERE h.user_id = ?`;
        return await this.query(sql, [user_id]);
    }

    async createPatient(hospital_id, fullname, nic, blood_group) {
        const sql = "INSERT INTO patients (hospital_id, fullname, nic, blood_group) VALUES (?, ?, ?, ?)";
        return await this.query(sql, [hospital_id, fullname, nic, blood_group]);
    }
}

module.exports = new PatientRepository();
