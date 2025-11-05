package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.GenerateOtpRequest;
import co.sportverse.sportverse_backend.dto.GenerateOtpResponse;
import co.sportverse.sportverse_backend.dto.PartnerLoginRequest;
import co.sportverse.sportverse_backend.dto.PartnerLoginResponse;
import co.sportverse.sportverse_backend.dto.VerifyOtpRequest;
import co.sportverse.sportverse_backend.dto.VerifyOtpResponse;
import co.sportverse.sportverse_backend.entity.User;
import co.sportverse.sportverse_backend.repository.PartnerRepository;
import co.sportverse.sportverse_backend.service.OtpService;
import co.sportverse.sportverse_backend.service.UserService;
import org.bson.Document;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8081")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserService userService;

    @Autowired
    private PartnerRepository partnerRepository;

    @PostMapping("/generate-otp")
    public ResponseEntity<GenerateOtpResponse> generateOtp(@RequestBody GenerateOtpRequest request) {
        try {
            // Validate phone number
            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new GenerateOtpResponse(false, "Phone number is required"));
            }

            // Validate channel
            String channel = request.getChannel();
            if (channel == null || channel.trim().isEmpty()) {
                channel = "sms"; // Default to SMS
            }

            if (!channel.equals("sms") && !channel.equals("whatsapp")) {
                return ResponseEntity.badRequest()
                    .body(new GenerateOtpResponse(false, "Invalid channel. Supported channels: sms, whatsapp"));
            }

            // Format phone number (ensure it starts with +)
            String phoneNumber = request.getPhoneNumber().trim();
            if (!phoneNumber.startsWith("+")) {
                phoneNumber = "+" + phoneNumber;
            }

            // Send OTP using Twilio Verification API
            Verification verification = otpService.sendOtp(phoneNumber, channel);
            
            return ResponseEntity.ok(new GenerateOtpResponse(
                true, 
                "OTP sent successfully via " + channel.toUpperCase(), 
                verification.getSid(),
                verification.getStatus()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new GenerateOtpResponse(false, "An error occurred while sending OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            // Validate phone number
            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new VerifyOtpResponse(false, "Phone number is required"));
            }

            // Validate OTP code
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new VerifyOtpResponse(false, "OTP code is required"));
            }

            // Format phone number (ensure it starts with +)
            String phoneNumber = request.getPhoneNumber().trim();
            if (!phoneNumber.startsWith("+")) {
                phoneNumber = "+" + phoneNumber;
            }

            // Verify OTP using Twilio Verification API
            VerificationCheck verificationCheck = otpService.verifyOtp(phoneNumber, request.getCode().trim());
            
            boolean isValid = verificationCheck.getValid();
            String status = verificationCheck.getStatus();
            
            if (isValid) {
                // Check if user exists, if not create a new user
                User existingUser = userService.getUserByMobileNumber(phoneNumber);
                User user;
                
                if (existingUser != null) {
                    user = existingUser;
                } else {
                    // Create new user with default name (can be updated later)
                    String defaultName = "User_" + phoneNumber.substring(phoneNumber.length() - 4);
                    user = userService.createUser(defaultName, phoneNumber, false);
                }
                
                String message = existingUser != null ? 
                    "OTP verified successfully - User logged in" : 
                    "OTP verified successfully - New user created";
                
                return ResponseEntity.ok(new VerifyOtpResponse(
                    true,
                    message,
                    status,
                    true,
                    user.getId(),
                    user.getName()
                ));
            } else {
                return ResponseEntity.ok(new VerifyOtpResponse(
                    false, 
                    "Invalid OTP code", 
                    status,
                    false
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new VerifyOtpResponse(false, "An error occurred while verifying OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/partner/login")
    public ResponseEntity<PartnerLoginResponse> partnerLogin(@RequestBody PartnerLoginRequest request) {
        try {
            // Validate partnerId
            if (request.getPartnerId() == null || request.getPartnerId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new PartnerLoginResponse(false, "Partner ID is required"));
            }

            // Validate password
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new PartnerLoginResponse(false, "Password is required"));
            }

            // Fetch partner from database
            Document partner = partnerRepository.findByPartnerId(request.getPartnerId().trim());
            
            if (partner == null) {
                return ResponseEntity.ok(new PartnerLoginResponse(false, "Invalid partner ID or password"));
            }

            // Verify password
            String storedPassword = partner.getString("password");
            if (storedPassword == null || !storedPassword.equals(request.getPassword().trim())) {
                return ResponseEntity.ok(new PartnerLoginResponse(false, "Invalid partner ID or password"));
            }

            // Login successful
            return ResponseEntity.ok(new PartnerLoginResponse(
                true,
                "Partner login successful",
                request.getPartnerId().trim()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new PartnerLoginResponse(false, "An error occurred while logging in: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth Service is running");
    }
}
