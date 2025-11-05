package co.sportverse.sportverse_backend.dto;

public class CreateUserRequest {
    private String name;
    private String mobileNumber;
    private Boolean isVenueOwner = false;

    public CreateUserRequest() {}

    public CreateUserRequest(String name, String mobileNumber, Boolean isVenueOwner) {
        this.name = name;
        this.mobileNumber = mobileNumber;
        this.isVenueOwner = isVenueOwner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public Boolean getIsVenueOwner() {
        return isVenueOwner;
    }

    public void setIsVenueOwner(Boolean isVenueOwner) {
        this.isVenueOwner = isVenueOwner;
    }
}
