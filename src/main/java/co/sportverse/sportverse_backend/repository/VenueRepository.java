package co.sportverse.sportverse_backend.repository;

import co.sportverse.sportverse_backend.entity.Venue;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static com.mongodb.client.model.Filters.eq;

@Component
public class VenueRepository {

    private final MongoCollection<Document> venuesCollection;

    @Autowired
    public VenueRepository(MongoClient mongoClient) {
        MongoDatabase database = mongoClient.getDatabase("sportverse");
        this.venuesCollection = database.getCollection("venues");
    }

    public Venue save(Venue venue) {
        Document doc = venue.toDocument();
        
        // Insert new document and get the generated ID
        venuesCollection.insertOne(doc);
        venue.setId(doc.getObjectId("_id").toString());
        return venue;
    }

    public Venue findById(String id) {
        Bson filter = eq("_id", new org.bson.types.ObjectId(id));
        return Venue.fromDocument(venuesCollection.find(filter).first());
    }

    public java.util.List<Venue> findByPartnerId(String ownerId) {
        Bson filter = eq("partnerId", ownerId);
        return venuesCollection.find(filter)
                .map(Venue::fromDocument)
                .into(new java.util.ArrayList<>());
    }

    public java.util.List<Venue> findAll() {
        return venuesCollection.find()
                .map(Venue::fromDocument)
                .into(new java.util.ArrayList<>());
    }

    public java.util.List<Venue> findByCity(String city) {
        Bson filter = eq("city", city);
        return venuesCollection.find(filter)
                .map(Venue::fromDocument)
                .into(new java.util.ArrayList<>());
    }
}
