/**
 * DonorController Class
 * 
 * This controller handles all requests related to Donor operations,
 * such as viewing profiles, fetching hospital locations, viewing open
 * requests, and accepting blood donation requests.
 * 
 * It follows Object-Oriented Principles (OOP) to encapsulate logic.
 */
const donorRepository = require("../repositories/DonorRepository");
const hospitalRepository = require("../repositories/HospitalRepository");
const requestRepository = require("../repositories/RequestRepository");
const eventBus = require("../services/EventBus");

class DonorController {
    /**
     * Constructor for DonorController
     * Initializes any necessary dependencies and binds methods.
     */
    constructor() {
        // Bind methods to ensure 'this' context is preserved when used as Express route handlers
        this.getHospitalLocations = this.getHospitalLocations.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.getAllRequests = this.getAllRequests.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
    }

    /**
     * Retrieves a list of all hospital locations available in the system.
     * 
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns a JSON array of hospital locations.
     */
    async getHospitalLocations(req, res) {
        try {
            console.log("[DonorController] Fetching hospital locations...");
            const locations = await hospitalRepository.findAllLocations();
            
            console.log(`[DonorController] Successfully retrieved ${locations.length || 0} locations.`);
            res.status(200).json(locations);
        } catch (err) {
            console.error("[DonorController] Error fetching hospital locations:", err.message);
            res.status(500).json({ 
                success: false,
                message: "Error fetching hospital locations",
                error: err.message 
            });
        }
    }

    /**
     * Fetches the specific profile information for a given donor by their user ID.
     * 
     * @param {Object} req - The Express request object, expecting user_id in params.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns the donor profile or a 404/500 error.
     */
    async getProfile(req, res) {
        const userId = req.params.user_id;

        try {
            console.log(`[DonorController] Fetching profile for user ID: ${userId}`);
            
            // Validate parameter
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID parameter is required"
                });
            }

            const profile = await donorRepository.findProfileByUserId(userId);
            
            if (!profile) {
                console.warn(`[DonorController] Profile not found for user ID: ${userId}`);
                return res.status(404).json({ 
                    success: false,
                    message: "Profile not found" 
                });
            }

            console.log(`[DonorController] Profile successfully retrieved for user ID: ${userId}`);
            res.status(200).json(profile);
        } catch (err) {
            console.error(`[DonorController] Server error fetching profile for user ID ${userId}:`, err.message);
            res.status(500).json({ 
                success: false,
                message: "Server error while fetching profile",
                error: err.message
            });
        }
    }

    /**
     * Retrieves all open, unfulfilled blood donation requests.
     * 
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns a JSON array of open requests.
     */
    async getAllRequests(req, res) {
        try {
            console.log("[DonorController] Fetching all open donation requests...");
            const requests = await requestRepository.findAllOpen();
            
            console.log(`[DonorController] Successfully retrieved ${requests.length || 0} open requests.`);
            res.status(200).json(requests);
        } catch (err) {
            console.error("[DonorController] Error fetching open requests:", err.message);
            res.status(500).json({ 
                success: false,
                message: "Failed to retrieve open requests",
                error: err.message 
            });
        }
    }

    /**
     * Allows a donor to accept a specific blood donation request.
     * Triggers the Observer Pattern (EventBus) upon successful acceptance.
     * 
     * @param {Object} req - The Express request object, expecting request_id and donor_user_id in body.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns success message or appropriate error.
     */
    async acceptRequest(req, res) {
        const { request_id, donor_user_id } = req.body;
        
        try {
            console.log(`[DonorController] User ID ${donor_user_id} attempting to accept request ID ${request_id}`);

            // Validate inputs
            if (!request_id || !donor_user_id) {
                return res.status(400).json({
                    success: false,
                    message: "request_id and donor_user_id are required fields"
                });
            }

            // Verify donor exists in the system
            const donor = await donorRepository.findIdByUserId(donor_user_id);
            if (!donor) {
                console.warn(`[DonorController] Donor mapping missing for User ID: ${donor_user_id}`);
                return res.status(404).json({ 
                    success: false,
                    message: "Donor profile missing or invalid." 
                });
            }

            // Perform the acceptance transaction
            await requestRepository.acceptRequest(request_id, donor.id);
            console.log(`[DonorController] Request ID ${request_id} successfully accepted by Donor ID ${donor.id}`);
            
            // Trigger Observer Pattern to handle side-effects (e.g., notifications)
            console.log("[DonorController] Emitting 'REQUEST_ACCEPTED' event to EventBus...");
            eventBus.emit("REQUEST_ACCEPTED", {
                request_id,
                donor_id: donor.id,
                timestamp: new Date().toISOString()
            });

            // Return successful confirmation
            res.status(200).json({ 
                success: true,
                message: "Request successfully accepted!" 
            });
        } catch (err) {
            console.error(`[DonorController] Acceptance failed for request ID ${request_id}:`, err.message);
            res.status(500).json({ 
                success: false,
                message: "Acceptance failed due to a server error.",
                error: err.message
            });
        }
    }
}

// Export a singleton instance of the DonorController
module.exports = new DonorController();
