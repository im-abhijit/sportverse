package co.sportverse.sportverse_backend.repository;

import co.sportverse.sportverse_backend.entity.User;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;

@Component
public class UserRepository {

    private final MongoCollection<Document> usersCollection;

    @Autowired
    public UserRepository(MongoClient mongoClient) {
        MongoDatabase database = mongoClient.getDatabase("sportverse");
        this.usersCollection = database.getCollection("users");
    }

    public User findByMobileNo(String mobileNo) {
        Bson filter = eq("userId", mobileNo);
        User result = User.fromDocument(usersCollection.find(filter).first());
        return result;
    }

    public User save(User user) {
        // Set createdAt if it's a new user
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }

        Document doc = user.toDocument();

        // If user has an ID, update existing document; otherwise insert new
        if (user.getId() != null) {
            Bson filter = eq("_id", new org.bson.types.ObjectId(user.getId()));
            usersCollection.replaceOne(filter, doc);
            return user;
        } else {
            // Insert new document and get the generated ID
            usersCollection.insertOne(doc);
            user.setId(doc.getObjectId("_id").toString());
            return user;
        }
    }

    public void updateIsVenueOwner(String userId, boolean isVenueOwner) {
        Bson filter = eq("_id", new org.bson.types.ObjectId(userId));
        Bson update = set("isVenueOwner", isVenueOwner);
        usersCollection.updateOne(filter, update);
    }

    public User updateByMobileNo(String mobileNo, String name, String city) {
        Bson filter = eq("phone", mobileNo);
        Document existing = usersCollection.find(filter).first();
        if (existing == null) {
            return null;
        }
        if (name != null && !name.trim().isEmpty()) {
            usersCollection.updateOne(filter, set("name", name.trim()));
        }
        if (city != null && !city.trim().isEmpty()) {
            usersCollection.updateOne(filter, set("city", city.trim()));
        }
        Document updated = usersCollection.find(filter).first();
        return User.fromDocument(updated);
    }
}
