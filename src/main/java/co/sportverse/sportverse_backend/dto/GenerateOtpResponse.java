package co.sportverse.sportverse_backend.dto;

public class GenerateOtpResponse {
    private boolean success;
    private String message;
    private String verificationSid;
    private String status;

    public GenerateOtpResponse() {}

    public GenerateOtpResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public GenerateOtpResponse(boolean success, String message, String verificationSid, String status) {
        this.success = success;
        this.message = message;
        this.verificationSid = verificationSid;
        this.status = status;
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

    public String getVerificationSid() {
        return verificationSid;
    }

    public void setVerificationSid(String verificationSid) {
        this.verificationSid = verificationSid;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
