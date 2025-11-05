package co.sportverse.sportverse_backend.entity;

import org.bson.Document;

public class TimeSlot {

    String slotId;
    String startTime;
    String endTime;
    int price;
    boolean isBooked;

    public TimeSlot() {}

    public TimeSlot(String slotId, String startTime, String endTime, int price, boolean isBooked) {
        this.slotId = slotId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.isBooked = isBooked;
    }

    public String getSlotId() {
        return slotId;
    }

    public void setSlotId(String slotId) {
        this.slotId = slotId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean booked) {
        isBooked = booked;
    }

    public static TimeSlot fromDocument(Document doc) {
        if (doc == null) return null;
        TimeSlot slot = new TimeSlot();
        slot.setSlotId(doc.getString("slotId"));
        slot.setStartTime(doc.getString("startTime"));
        slot.setEndTime(doc.getString("endTime"));
        Object priceValue = doc.get("price");
        if (priceValue instanceof Number) {
            slot.setPrice(((Number) priceValue).intValue());
        }
        slot.setBooked(doc.getBoolean("isBooked", false));
        return slot;
    }

    public Document toDocument() {
        Document doc = new Document();
        doc.append("slotId", this.slotId);
        doc.append("startTime", this.startTime);
        doc.append("endTime", this.endTime);
        doc.append("price", this.price);
        doc.append("isBooked", this.isBooked);
        return doc;
    }
}


