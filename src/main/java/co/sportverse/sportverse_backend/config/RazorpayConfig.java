package co.sportverse.sportverse_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RazorpayConfig {

    @Value("${razorpay.key_id}")
    private String key_id;

    @Value("${razorpay.key_secret}")
    private String key_secret;

    public String getKey_id() {
        return key_id;
    }

    public void setKey_id(String key_id) { this.key_id = key_id; }

    public String getKey_secret() {
        return key_secret;
    }

    public void setKey_secret(String key_secret) { this.key_secret = key_secret; }
}


