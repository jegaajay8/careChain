const BaseRepository = require("./BaseRepository");

class RequestRepository extends BaseRepository {
    async findAllOpen() {
        const sql = `
            SELECT r.id, r.hospital_id, r.blood_group, r.district, r.status, h.hospital_name 
            FROM requests r
            JOIN hospitals h ON r.hospital_id = h.id
            WHERE r.status = 'open'
            ORDER BY r.id DESC`;
        return await this.query(sql);
    }

    async acceptRequest(request_id, donor_id) {
        const sql = "UPDATE requests SET accepted_donor_id = ?, status = 'accepted' WHERE id = ?";
        return await this.query(sql, [donor_id, request_id]);
    }

    async createRequest(hospital_id, blood_group, district) {
        const sql = "INSERT INTO requests (hospital_id, blood_group, district, status) VALUES (?, ?, ?, 'open')";
        return await this.query(sql, [hospital_id, blood_group, district]);
    }

    async findAcceptedByHospitalUser(user_id) {
        const sql = `
            SELECT 
                r.id as request_id, 
                d.fullname, 
                d.telephone, 
                r.blood_group,
                u.username as donor_username
            FROM requests r
            JOIN donors d ON r.accepted_donor_id = d.id
            JOIN users u ON d.user_id = u.id
            JOIN hospitals h ON r.hospital_id = h.id
            WHERE h.user_id = ? AND r.status = 'accepted'
        `;
        return await this.query(sql, [user_id]);
    }

    async completeRequest(request_id) {
        const sql = "UPDATE requests SET status = 'closed' WHERE id = ?";
        return await this.query(sql, [request_id]);
    }
}

module.exports = new RequestRepository();
