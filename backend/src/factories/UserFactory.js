const userRepository = require("../repositories/UserRepository");
const hospitalRepository = require("../repositories/HospitalRepository");
const donorRepository = require("../repositories/DonorRepository");

class UserFactory {
    async registerHospital(userData, profileData) {
        const { username, password } = userData;
        const user_id = await userRepository.createUser(username, password, 'hospital');
        
        await hospitalRepository.createProfile({
            user_id,
            ...profileData
        });
        
        return user_id;
    }

    async registerDonor(userData, profileData) {
        const { username, password } = userData;
        const user_id = await userRepository.createUser(username, password, 'donor');
        
        await donorRepository.createProfile({
            user_id,
            ...profileData
        });
        
        return user_id;
    }
}

module.exports = new UserFactory();
