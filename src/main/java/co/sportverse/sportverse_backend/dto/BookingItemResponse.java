package co.sportverse.sportverse_backend.dto;

import co.sportverse.sportverse_backend.entity.TimeSlot;

public class BookingItemResponse {
    private String id;
    private VenueResponse venue;
    private String date;
    private java.util.List<TimeSlot> slots;
    private int amount;
    private String bookingStatus;
    private String paymentStatus;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public VenueResponse getVenue() { return venue; }
    public void setVenue(VenueResponse venue) { this.venue = venue; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public java.util.List<TimeSlot> getSlots() { return slots; }
    public void setSlots(java.util.List<TimeSlot> slots) { this.slots = slots; }
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}


