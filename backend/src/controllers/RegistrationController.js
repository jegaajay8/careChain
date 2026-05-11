const userFactory = require("../factories/UserFactory");

class RegistrationController {
    async registerHospital(req, res) {
        const { username, password, ...profileData } = req.body;
        try {
            await userFactory.registerHospital({ username, password }, profileData);
            res.status(200).json({ message: "Hospital Registered Successfully!" });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Username exists." });
            }
            res.status(500).json({ message: "Account creation failed." });
        }
    }

    async registerDonor(req, res) {
        const { username, password, ...profileData } = req.body;
        try {
            await userFactory.registerDonor({ username, password }, profileData);
            res.status(200).json({ message: "Donor Registered Successfully!" });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Username already exists." });
            }
            res.status(500).json({ message: "Failed to save donor profile." });
        }
    }
}

module.exports = new RegistrationController();
