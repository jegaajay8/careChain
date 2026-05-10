const donorRepository = require("../repositories/DonorRepository");
const hospitalRepository = require("../repositories/HospitalRepository");
const requestRepository = require("../repositories/RequestRepository");
const eventBus = require("../services/EventBus");

class DonorController {
    async getHospitalLocations(req, res) {
        try {
            const locations = await hospitalRepository.findAllLocations();
            res.json(locations);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getProfile(req, res) {
        try {
            const profile = await donorRepository.findProfileByUserId(req.params.user_id);
            if (!profile) return res.status(404).json({ message: "Profile not found" });
            res.json(profile);
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }

    async getAllRequests(req, res) {
        try {
            const requests = await requestRepository.findAllOpen();
            res.json(requests);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async acceptRequest(req, res) {
        const { request_id, donor_user_id } = req.body;
        try {
            const donor = await donorRepository.findIdByUserId(donor_user_id);
            if (!donor) return res.status(500).json({ message: "Donor missing." });

            await requestRepository.acceptRequest(request_id, donor.id);
            
            // Trigger Observer Pattern
            eventBus.emit("REQUEST_ACCEPTED", {
                request_id,
                donor_id: donor.id
            });

            res.status(200).json({ message: "Request Accepted!" });
        } catch (err) {
            res.status(500).json({ message: "Acceptance failed." });
        }
    }
}

module.exports = new DonorController();
