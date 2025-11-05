package co.sportverse.sportverse_backend.service;

import co.sportverse.sportverse_backend.entity.User;
import co.sportverse.sportverse_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new user
     */
    public User createUser(String name, String mobileNumber, Boolean isVenueOwner) {
        // Check if user already exists using findByMobileNo
        User existingUser = userRepository.findByMobileNo(mobileNumber);
        if (existingUser != null) {
            throw new RuntimeException("User with mobile number " + mobileNumber + " already exists");
        }

        User user = new User(name, mobileNumber, isVenueOwner);
        return userRepository.save(user);
    }

    /**
     * Get user by mobile number
     */
    public User getUserByMobileNumber(String mobileNumber) {
        return userRepository.findByMobileNo(mobileNumber);
    }

    public User updateUserByMobileNumber(String mobileNumber, String name, String city) {
        return userRepository.updateByMobileNo(mobileNumber, name, city);
    }
}
