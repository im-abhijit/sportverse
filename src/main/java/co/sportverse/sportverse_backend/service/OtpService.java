package co.sportverse.sportverse_backend.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.verification.service.sid}")
    private String verificationServiceSid;

    public Verification sendOtp(String phoneNumber, String channel) {
        try {
            System.out.println("Account Sid: " + accountSid);
            System.out.println("Auth Token: " + authToken);
            System.out.println("Verification Service Sid: " + verificationServiceSid);
            Twilio.init(accountSid, authToken);
            
            Verification verification = Verification.creator(
                    verificationServiceSid,
                    phoneNumber,
                    channel)
                .create();

            System.out.println("OTP sent successfully. Verification SID: " + verification.getSid());
            return verification;
            
        } catch (Exception e) {
            System.err.println("Error sending OTP: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP: " + e.getMessage());
        }
    }

    public VerificationCheck verifyOtp(String phoneNumber, String code) {
        try {
            Twilio.init(accountSid, authToken);
            
            VerificationCheck verificationCheck = VerificationCheck.creator(verificationServiceSid)
                    .setTo(phoneNumber)
                    .setCode(code)
                    .create();

            System.out.println("OTP verification completed. Status: " + verificationCheck.getStatus());
            return verificationCheck;
            
        } catch (Exception e) {
            System.err.println("Error verifying OTP: " + e.getMessage());
            throw new RuntimeException("Failed to verify OTP: " + e.getMessage());
        }
    }
}