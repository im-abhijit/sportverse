package co.sportverse.sportverse_backend.dto;

import co.sportverse.sportverse_backend.entity.Venue;

public class VenueResponse {
    private String id;
    private String name;
    private String description;
    private java.util.List<String> games;
    private String addtress;
    private java.util.List<String> photos;
    private String partnerId;
    private String city;
    private String partnerMobileNo;

    public VenueResponse() {}

    public VenueResponse(Venue venue) {
        this.id = venue.getId();
        this.name = venue.getName();
        this.description = venue.getDescription();
        this.games = venue.getGames();
        this.addtress = venue.getLocation();
        this.photos = venue.getPhotos();
        this.partnerId = venue.getPartnerId();
        this.city = venue.getCity();
        this.partnerMobileNo = venue.getPartnerMobileNo();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public java.util.List<String> getGames() {
        return games;
    }

    public void setGames(java.util.List<String> games) {
        this.games = games;
    }

    public String getAddtress() {
        return addtress;
    }

    public void setAddtress(String addtress) {
        this.addtress = addtress;
    }

    public java.util.List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(java.util.List<String> photos) {
        this.photos = photos;
    }

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPartnerMobileNo() {
        return partnerMobileNo;
    }

    public void setPartnerMobileNo(String partnerMobileNo) {
        this.partnerMobileNo = partnerMobileNo;
    }
}

