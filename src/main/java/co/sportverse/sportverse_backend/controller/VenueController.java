package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.ApiResponse;
import co.sportverse.sportverse_backend.dto.CreateVenueRequest;
import co.sportverse.sportverse_backend.dto.VenueResponse;
import co.sportverse.sportverse_backend.entity.Venue;
import co.sportverse.sportverse_backend.repository.VenueRepository;
import co.sportverse.sportverse_backend.repository.UserRepository;
import co.sportverse.sportverse_backend.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*")
public class VenueController {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @PostMapping
    public ResponseEntity<ApiResponse> createVenue(@RequestBody CreateVenueRequest request) {
        try {
            // Validate required fields
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Venue name is required"));
            }

            if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Venue location is required"));
            }

            if (request.getPartnerId() == null || request.getPartnerId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Partner ID is required. Please provide "));
            }

            if (request.getPartnerMobileNo() == null || request.getPartnerMobileNo().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Partner mobile no is required. Please provide"));
            }

            // Validate photos (max 3)
            if (request.getPhotos() != null && request.getPhotos().size() > 3) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Maximum 3 photos allowed"));
            }

            // Create venue entity
            Venue venue = new Venue(
                request.getName(),
                request.getDescription(),
                request.getGames(),
                request.getLocation(),
                request.getPhotos(),
                request.getPartnerId(),
                request.getCity(),
                request.getPartnerMobileNo()
            );

            // Save venue using repository
            Venue savedVenue = venueRepository.save(venue);

            // Add venue ID to partner's venues list
            if (request.getPartnerId() != null && !request.getPartnerId().trim().isEmpty()) {
                try {
                    partnerRepository.addVenueToPartner(request.getPartnerId().trim(), savedVenue.getId());
                } catch (Exception e) {
                    // Log error but don't fail the venue creation
                    System.err.println("Failed to update partner venues: " + e.getMessage());
                }
            }

            VenueResponse response = new VenueResponse(savedVenue);

            return ResponseEntity.ok(new ApiResponse(true, "Venue created successfully", response));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error creating venue: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getVenueById(@PathVariable String id) {
        try {
            Venue venue = venueRepository.findById(id);
            if (venue != null) {
                VenueResponse response = new VenueResponse(venue);
                return ResponseEntity.ok(new ApiResponse(true, "Venue found", response));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error fetching venue: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllVenues() {
        try {
            java.util.List<Venue> venues = venueRepository.findAll();
            java.util.List<VenueResponse> responses = venues.stream()
                    .map(VenueResponse::new)
                    .toList();
            return ResponseEntity.ok(new ApiResponse(true, "Venues retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error fetching venues: " + e.getMessage()));
        }
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse> getVenuesByCity(@PathVariable String city) {
        try {
            if (city == null || city.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "City is required"));
            }
            java.util.List<Venue> venues = venueRepository.findByCity(city.trim());
            java.util.List<VenueResponse> responses = venues.stream().map(VenueResponse::new).toList();
            return ResponseEntity.ok(new ApiResponse(true, "Venues retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error fetching venues: " + e.getMessage()));
        }
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<ApiResponse> getVenuesByOwner(@PathVariable String partnerId) {
        try {
            java.util.List<Venue> venues = venueRepository.findByPartnerId(partnerId);
            java.util.List<VenueResponse> responses = venues.stream()
                    .map(VenueResponse::new)
                    .toList();
            return ResponseEntity.ok(new ApiResponse(true, "Venues retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error fetching venues: " + e.getMessage()));
        }
    }
}

