package co.sportverse.sportverse_backend.dto;

public class UpdateUserRequest {
    private String name;
    private Boolean isVenueOwner;

    public UpdateUserRequest() {}

    public UpdateUserRequest(String name, Boolean isVenueOwner) {
        this.name = name;
        this.isVenueOwner = isVenueOwner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsVenueOwner() {
        return isVenueOwner;
    }

    public void setIsVenueOwner(Boolean isVenueOwner) {
        this.isVenueOwner = isVenueOwner;
    }
}
