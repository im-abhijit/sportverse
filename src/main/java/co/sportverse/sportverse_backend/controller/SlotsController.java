package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.ApiResponse;
import co.sportverse.sportverse_backend.dto.CreateSlotsRequest;
import co.sportverse.sportverse_backend.dto.SlotsResponse;
import co.sportverse.sportverse_backend.entity.TimeSlot;
import co.sportverse.sportverse_backend.entity.VenueSlots;
import co.sportverse.sportverse_backend.service.SlotsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class SlotsController {

    @Autowired
    private SlotsService slotsService;

    @PostMapping
    public ResponseEntity<ApiResponse> createSlots(@RequestBody CreateSlotsRequest request) {
        try {
            if (request.getVenueId() == null || request.getVenueId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "venueId is required"));
            }
            if (request.getDate() == null || request.getDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "date is required (yyyy-MM-dd)"));
            }
            if (request.getSlots() == null || request.getSlots().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "slots are required"));
            }

            VenueSlots saved = slotsService.createSlots(request);
            return ResponseEntity.ok(new ApiResponse(true, "Slots created successfully", new SlotsResponse(saved)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error creating slots: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getSlotsByVenueAndDate(
            @RequestParam(value = "venueId", required = false) String venueId,
            @RequestParam(value = "date", required = false) String date) {
        try {
            if (venueId == null || venueId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "venueId is required"));
            }
            if (date == null || date.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "date is required (yyyy-MM-dd)"));
            }
            VenueSlots vs = slotsService.getSlotsByVenueAndDate(venueId, date);
            if (vs == null) {
                return ResponseEntity.ok(new ApiResponse(true, "No slots found for given venue and date", null));
            }
            return ResponseEntity.ok(new ApiResponse(true, "Slots retrieved successfully", new SlotsResponse(vs)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error fetching slots: " + e.getMessage()));
        }
    }
}


