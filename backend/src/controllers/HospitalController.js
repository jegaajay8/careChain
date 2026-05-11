const hospitalRepository = require("../repositories/HospitalRepository");
const patientRepository = require("../repositories/PatientRepository");
const requestRepository = require("../repositories/RequestRepository");
const eventBus = require("../services/EventBus");

class HospitalController {
    async getPatients(req, res) {
        try {
            const patients = await patientRepository.findByHospitalUser(req.params.user_id);
            res.json(patients);
        } catch (err) {
            res.status(500).json({ message: "Error loading patients" });
        }
    }

    async addPatient(req, res) {
        const { hospital_user_id, fullname, nic, blood_group } = req.body;
        try {
            const hospital = await hospitalRepository.findByUserId(hospital_user_id);
            if (!hospital) return res.status(404).json({ message: "Hospital not found." });

            await patientRepository.createPatient(hospital.id, fullname, nic, blood_group);
            res.status(200).json({ message: "Patient record added." });
        } catch (err) {
            res.status(500).json({ message: "Insertion error." });
        }
    }

    async sendRequest(req, res) {
        const { hospital_user_id, blood_group, district } = req.body;
        try {
            const hospital = await hospitalRepository.findByUserId(hospital_user_id);
            if (!hospital) return res.status(404).json({ message: "Hospital not found." });

            await requestRepository.createRequest(hospital.id, blood_group, district);
            
            // Trigger Observer Pattern
            eventBus.emit("BLOOD_REQUEST_CREATED", {
                hospital_id: hospital.id,
                blood_group,
                district
            });

            res.status(200).json({ message: "Blood request broadcasted!" });
        } catch (err) {
            res.status(500).json({ message: "Broadcast failed." });
        }
    }

    async getAcceptedDonors(req, res) {
        try {
            const donors = await requestRepository.findAcceptedByHospitalUser(req.params.user_id);
            res.json(donors);
        } catch (err) {
            res.status(500).json({ message: "Error loading accepted donors" });
        }
    }

    async completeRequest(req, res) {
        const { request_id } = req.body;
        try {
            await requestRepository.completeRequest(request_id);
            res.status(200).json({ message: "Donation marked as completed." });
        } catch (err) {
            res.status(500).json({ message: "Could not close request." });
        }
    }
}

module.exports = new HospitalController();
