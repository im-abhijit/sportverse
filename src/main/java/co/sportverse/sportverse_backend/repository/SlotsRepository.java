package co.sportverse.sportverse_backend.repository;

import co.sportverse.sportverse_backend.entity.VenueSlots;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

@Component
public class SlotsRepository {

    private final MongoCollection<Document> slotsCollection;

    @Autowired
    public SlotsRepository(MongoClient mongoClient) {
        MongoDatabase database = mongoClient.getDatabase("sportverse");
        this.slotsCollection = database.getCollection("slots");
    }

    public VenueSlots save(VenueSlots venueSlots) {
        if (venueSlots.getCreatedAt() == null) {
            venueSlots.setCreatedAt(LocalDateTime.now());
        }
        Document doc = venueSlots.toDocument();
        slotsCollection.insertOne(doc);
        venueSlots.setId(doc.getObjectId("_id").toString());
        return venueSlots;
    }

    public VenueSlots findByVenueIdAndDate(String venueId, String date) {
        Bson filter = and(eq("venueId", new org.bson.types.ObjectId(venueId)), eq("date", date));
        return VenueSlots.fromDocument(slotsCollection.find(filter).first());
    }

    public void markSlotsBooked(String venueId, String date, java.util.List<String> slotIds) {
        if (slotIds == null || slotIds.isEmpty()) return;
        Bson filter = and(eq("venueId", new org.bson.types.ObjectId(venueId)), eq("date", date));
        Document doc = slotsCollection.find(filter).first();
        if (doc == null) return;
        java.util.List<Document> slotDocs = (java.util.List<Document>) doc.get("slots");
        if (slotDocs != null) {
            java.util.Set<String> target = new java.util.HashSet<>(slotIds);
            for (Document s : slotDocs) {
                String sid = s.getString("slotId");
                if (sid != null && target.contains(sid)) {
                    s.put("isBooked", true);
                }
            }
            doc.put("slots", slotDocs);
            slotsCollection.replaceOne(filter, doc);
        }
    }
}


