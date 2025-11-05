package co.sportverse.sportverse_backend.entity;

import org.bson.Document;

import java.time.LocalDateTime;


public class User {

    String id;

    String name;

    String phone;

    String city;

    Boolean isVenueOwner;

    private LocalDateTime createdAt;

    // Constructors
    public User() {}

    public User(String name, String mobileNumber, Boolean isVenueOwner) {
        this.name = name;
        this.phone = mobileNumber;
        this.isVenueOwner = isVenueOwner;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getVenueOwner() {
        return isVenueOwner;
    }

    public void setVenueOwner(Boolean venueOwner) {
        isVenueOwner = venueOwner;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", mobileNumber='" + phone + '\'' +
                ", isVenueOwner=" + isVenueOwner +
                ", createdAt=" + createdAt +
                '}';
    }

    public static User fromDocument(Document doc) {
        if (doc == null) return null;
        User user = new User();
        user.setId(doc.getObjectId("_id").toString());
        user.setName(doc.getString("name"));
        user.setPhone(doc.getString("phone"));
        user.setCity(doc.getString("city"));
        user.setVenueOwner(doc.getBoolean("isVenueOwner", false));
        return user;
    }

    public Document toDocument() {
        Document doc = new Document();
        if (this.id != null) {
            doc.append("_id", new org.bson.types.ObjectId(this.id));
        }
        doc.append("name", this.name);
        doc.append("phone", this.phone);
        doc.append("city", this.city);
        doc.append("isVenueOwner", this.isVenueOwner != null ? this.isVenueOwner : false);
        if (this.createdAt != null) {
            doc.append("createdAt", this.createdAt);
        }
        return doc;
    }
}
