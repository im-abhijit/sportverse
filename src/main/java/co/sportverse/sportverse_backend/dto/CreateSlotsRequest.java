package co.sportverse.sportverse_backend.dto;

import java.util.List;

public class CreateSlotsRequest {
    private String venueId;
    private String date; // yyyy-MM-dd
    private java.util.List<SlotDto> slots;

    public static class SlotDto {
        private String slotId;
        private String startTime;
        private String endTime;
        private int price;
        private boolean isBooked;

        public String getSlotId() { return slotId; }
        public void setSlotId(String slotId) { this.slotId = slotId; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public int getPrice() { return price; }
        public void setPrice(int price) { this.price = price; }
        public boolean isBooked() { return isBooked; }
        public void setBooked(boolean booked) { isBooked = booked; }
    }

    public String getVenueId() { return venueId; }
    public void setVenueId(String venueId) { this.venueId = venueId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public java.util.List<SlotDto> getSlots() { return slots; }
    public void setSlots(java.util.List<SlotDto> slots) { this.slots = slots; }
}


