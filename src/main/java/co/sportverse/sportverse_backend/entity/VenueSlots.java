package co.sportverse.sportverse_backend.entity;

import org.bson.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class VenueSlots {

    String id;
    String venueId;
    String date; // ISO yyyy-MM-dd
    java.util.List<TimeSlot> slots;
    LocalDateTime createdAt;

    public VenueSlots() {}

    public VenueSlots(String venueId, String date, List<TimeSlot> slots) {
        this.venueId = venueId;
        this.date = date;
        this.slots = slots;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVenueId() { return venueId; }
    public void setVenueId(String venueId) { this.venueId = venueId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public java.util.List<TimeSlot> getSlots() { return slots; }
    public void setSlots(java.util.List<TimeSlot> slots) { this.slots = slots; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "VenueSlots{" +
                "id='" + id + '\'' +
                ", venueId='" + venueId + '\'' +
                ", date='" + date + '\'' +
                ", slots=" + slots +
                ", createdAt=" + createdAt +
                '}';
    }

    public static VenueSlots fromDocument(Document doc) {
        if (doc == null) return null;
        VenueSlots vs = new VenueSlots();
        vs.setId(doc.getObjectId("_id").toString());
        vs.setVenueId(doc.getObjectId("venueId").toString());
        vs.setDate(doc.getString("date"));
        java.util.List<Document> slotDocs = (java.util.List<Document>) doc.get("slots");
        if (slotDocs != null) {
            vs.setSlots(slotDocs.stream().map(TimeSlot::fromDocument).collect(Collectors.toList()));
        }
        Object createdAtObj = doc.get("createdAt");
        if (createdAtObj instanceof java.time.Instant) {
            vs.setCreatedAt(LocalDateTime.ofInstant((java.time.Instant) createdAtObj, java.time.ZoneOffset.UTC));
        }
        return vs;
    }

    public Document toDocument() {
        Document doc = new Document();
        if (this.id != null) {
            doc.append("_id", new org.bson.types.ObjectId(this.id));
        }
        doc.append("venueId", new org.bson.types.ObjectId(this.venueId));
        doc.append("date", this.date);
        java.util.List<Document> slotDocs = new java.util.ArrayList<>();
        if (this.slots != null) {
            for (TimeSlot s : this.slots) {
                slotDocs.add(s.toDocument());
            }
        }
        doc.append("slots", slotDocs);
        if (this.createdAt != null) {
            doc.append("createdAt", this.createdAt);
        }
        return doc;
    }
}


