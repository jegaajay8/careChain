const userRepository = require("../repositories/UserRepository");

class AuthController {
    async getMasterHospitals(req, res) {
        try {
            const hospitals = await userRepository.getMasterHospitals();
            res.json(hospitals);
        } catch (err) {
            res.status(500).json({ message: "Error fetching hospitals" });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await userRepository.findByUsernameAndPassword(username, password);
            if (user) {
                res.json(user);
            } else {
                res.status(401).json({ message: "Invalid username or password" });
            }
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = new AuthController();
