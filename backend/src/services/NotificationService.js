const eventBus = require("./EventBus");

class NotificationService {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        eventBus.on("BLOOD_REQUEST_CREATED", (data) => {
            console.log(`[NotificationService] 📢 New Blood Request Broadcasted!`);
            console.log(`[Details] Hospital ID: ${data.hospital_id}, Blood Group: ${data.blood_group}, District: ${data.district}`);
            // In a real app, this would send SMS/Emails to donors
        });

        eventBus.on("REQUEST_ACCEPTED", (data) => {
            console.log(`[NotificationService] ✅ Blood Request Accepted by donor!`);
            console.log(`[Details] Request ID: ${data.request_id}, Donor ID: ${data.donor_id}`);
        });
    }
}

module.exports = new NotificationService();
