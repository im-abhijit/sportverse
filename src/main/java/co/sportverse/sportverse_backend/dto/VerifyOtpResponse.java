package co.sportverse.sportverse_backend.dto;

public class VerifyOtpResponse {
    private boolean success;
    private String message;
    private String status;
    private boolean valid;
    private String userId;
    private String userName;

    public VerifyOtpResponse() {}

    public VerifyOtpResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public VerifyOtpResponse(boolean success, String message, String status, boolean valid) {
        this.success = success;
        this.message = message;
        this.status = status;
        this.valid = valid;
    }

    public VerifyOtpResponse(boolean success, String message, String status, boolean valid, String userId, String userName) {
        this.success = success;
        this.message = message;
        this.status = status;
        this.valid = valid;
        this.userId = userId;
        this.userName = userName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
