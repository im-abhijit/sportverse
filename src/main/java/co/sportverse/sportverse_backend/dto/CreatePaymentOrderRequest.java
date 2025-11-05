package co.sportverse.sportverse_backend.dto;

import java.util.List;

public class CreatePaymentOrderRequest {
    private int amount;
    private String userId;
    private String venueId;
    private List<String> slotIds;
    private String date; // yyyy-MM-dd

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getVenueId() { return venueId; }
    public void setVenueId(String venueId) { this.venueId = venueId; }
    public java.util.List<String> getSlotIds() { return slotIds; }
    public void setSlotIds(java.util.List<String> slotIds) { this.slotIds = slotIds; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}


