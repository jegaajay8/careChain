const dbProxy = require("../config/DatabaseProxy");

class BaseRepository {
    constructor() {
        this.db = dbProxy;
    }

    async query(sql, params) {
        return await this.db.query(sql, params);
    }
}

module.exports = BaseRepository;
