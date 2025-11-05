package co.sportverse.sportverse_backend.dto;

public class PartnerLoginResponse {
    private boolean success;
    private String message;
    private String partnerId;

    public PartnerLoginResponse() {}

    public PartnerLoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public PartnerLoginResponse(boolean success, String message, String partnerId) {
        this.success = success;
        this.message = message;
        this.partnerId = partnerId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }
}

