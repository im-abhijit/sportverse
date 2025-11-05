package co.sportverse.sportverse_backend.config;

import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.connection.ConnectionPoolSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mongodb.ConnectionString;
import java.util.concurrent.TimeUnit;

@Configuration
public class MongoClientConfig {

    @Value("${mongo.connection-string}")
    private String connectionStringProperty;

    @Bean
    public MongoClient mongoClient() {
        //MongoClients.create(CONNECTION_STRING);

        ConnectionString connectionString = new ConnectionString(connectionStringProperty);
        MongoClientSettings clientSettings = MongoClientSettings.builder()
                .retryWrites(true)
                .applyConnectionString(connectionString)
                .applyToConnectionPoolSettings((ConnectionPoolSettings.Builder builder) -> {
                    builder.maxSize(100) //connections count
                            .minSize(5)
                            .maxConnectionLifeTime(30, TimeUnit.MINUTES)
                            .maxConnectionIdleTime( 1000000, TimeUnit.MILLISECONDS);
                })
                .applyToSocketSettings(builder -> {
                    builder.connectTimeout(2000, TimeUnit.MILLISECONDS);
                })
                .applicationName("appname")
                .build();

        return MongoClients.create(clientSettings);
    }
}