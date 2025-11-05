package co.sportverse.sportverse_backend.dto;

import java.util.List;

public class CreateVenueRequest {
    private String name;
    private String description;
    private List<String> games;
    private String location;
    private List<String> photos;
    private String city;
    private String partnerId;
    private String partnerMobileNo;

    public CreateVenueRequest() {}

    public CreateVenueRequest(String name, String description, List<String> games, String location, List<String> photos) {
        this.name = name;
        this.description = description;
        this.games = games;
        this.location = location;
        this.photos = photos;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getGames() {
        return games;
    }

    public void setGames(List<String> games) {
        this.games = games;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerMobileNo() {
        return partnerMobileNo;
    }

    public void setPartnerMobileNo(String partnerMobileNo) {
        this.partnerMobileNo = partnerMobileNo;
    }
}

