package co.sportverse.sportverse_backend.dto;

import co.sportverse.sportverse_backend.entity.TimeSlot;
import co.sportverse.sportverse_backend.entity.VenueSlots;

public class SlotsResponse {
    private String id;
    private String venueId;
    private String date;
    private java.util.List<TimeSlot> slots;

    public SlotsResponse() {}

    public SlotsResponse(VenueSlots venueSlots) {
        this.id = venueSlots.getId();
        this.venueId = venueSlots.getVenueId();
        this.date = venueSlots.getDate();
        this.slots = venueSlots.getSlots();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getVenueId() { return venueId; }
    public void setVenueId(String venueId) { this.venueId = venueId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public java.util.List<TimeSlot> getSlots() { return slots; }
    public void setSlots(java.util.List<TimeSlot> slots) { this.slots = slots; }
}


