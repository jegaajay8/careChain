/**
 * AuthController Class
 * 
 * This controller handles all authentication-related requests.
 * It follows Object-Oriented Principles (OOP) to encapsulate logic.
 */
const userRepository = require("../repositories/UserRepository");

class AuthController {
    /**
     * Constructor for AuthController
     * Initializes any necessary dependencies and binds methods.
     */
    constructor() {
        // Bind methods to ensure 'this' context is preserved when used as Express route handlers
        this.getMasterHospitals = this.getMasterHospitals.bind(this);
        this.login = this.login.bind(this);
    }

    /**
     * Retrieves the list of master hospitals from the database.
     * 
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns a JSON response with hospitals or an error.
     */
    async getMasterHospitals(req, res) {
        try {
            console.log("[AuthController] Fetching master hospitals...");
            const hospitals = await userRepository.getMasterHospitals();
            
            // Successfully retrieved hospitals
            res.status(200).json(hospitals);
        } catch (err) {
            console.error("[AuthController] Error fetching hospitals:", err.message);
            // Return a structured error response
            res.status(500).json({ 
                success: false,
                message: "Error fetching hospitals",
                error: err.message 
            });
        }
    }

    /**
     * Authenticates a user based on username and password.
     * 
     * @param {Object} req - The Express request object containing credentials in the body.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} - Returns the authenticated user data or an unauthorized error.
     */
    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            console.log(`[AuthController] Attempting login for user: ${username}`);
            
            // Validate input before querying
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false,
                    message: "Username and password are required" 
                });
            }

            const user = await userRepository.findByUsernameAndPassword(username, password);
            
            if (user) {
                console.log(`[AuthController] Login successful for: ${username}`);
                res.status(200).json(user);
            } else {
                console.warn(`[AuthController] Invalid credentials for: ${username}`);
                res.status(401).json({ 
                    success: false,
                    message: "Invalid username or password" 
                });
            }
        } catch (err) {
            console.error("[AuthController] Server error during login:", err.message);
            res.status(500).json({ 
                success: false,
                message: "Server error during authentication process" 
            });
        }
    }
}

// Export a singleton instance of the AuthController
module.exports = new AuthController();
