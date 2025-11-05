package co.sportverse.sportverse_backend.dto;

import co.sportverse.sportverse_backend.entity.User;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String name;
    private String mobileNumber;
    private Boolean isVenueOwner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserResponse() {}


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
