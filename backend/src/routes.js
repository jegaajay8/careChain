const express = require("express");
const router = express.Router();

const authController = require("./controllers/AuthController");
const registrationController = require("./controllers/RegistrationController");
const donorController = require("./controllers/DonorController");
const hospitalController = require("./controllers/HospitalController");

// 1. MASTER DATA & AUTHENTICATION
router.get("/api/master-hospitals", authController.getMasterHospitals);
router.post("/login", authController.login);

// 2. REGISTRATION
router.post("/register-hospital", registrationController.registerHospital);
router.post("/register-donor", registrationController.registerDonor);

// 3. DONOR DASHBOARD API
router.get("/api/hospital-locations", donorController.getHospitalLocations);
router.get("/api/donor-profile/:user_id", donorController.getProfile);
router.get("/api/all-requests", donorController.getAllRequests);
router.post("/api/accept-request", donorController.acceptRequest);

// 4. HOSPITAL DASHBOARD API
router.get("/api/get-patients/:user_id", hospitalController.getPatients);
router.post("/api/add-patient", hospitalController.addPatient);
router.post("/api/send-request", hospitalController.sendRequest);
router.get("/api/accepted-donors/:user_id", hospitalController.getAcceptedDonors);
router.post("/api/complete-request", hospitalController.completeRequest);

module.exports = router;
