package co.sportverse.sportverse_backend.dto;

public class PartnerLoginRequest {
    private String partnerId;
    private String password;

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

