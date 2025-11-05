package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.ApiResponse;
import co.sportverse.sportverse_backend.dto.BookingItemResponse;
import co.sportverse.sportverse_backend.dto.CreateBookingRequest;
import co.sportverse.sportverse_backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getBookingsByUser(@PathVariable String userId) {
        try {
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "userId is required"));
            }
            List<BookingItemResponse> bookings = bookingService.getUserBookings(userId.trim());
            return ResponseEntity.ok(new ApiResponse(true, "Bookings retrieved successfully", bookings));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error fetching bookings: " + e.getMessage()));
        }
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<ApiResponse> getBookingsByPartner(@PathVariable String partnerId) {
        try {
            if (partnerId == null || partnerId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "partnerId is required"));
            }
            List<BookingItemResponse> bookings = bookingService.getPartnerBookings(partnerId.trim());
            return ResponseEntity.ok(new ApiResponse(true, "Partner bookings retrieved successfully", bookings));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error fetching partner bookings: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            // Validate required fields
            if (request.getPartnerId() == null || request.getPartnerId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "partnerId is required"));
            }
            if (request.getVenueId() == null || request.getVenueId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "venueId is required"));
            }
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "userId is required"));
            }
            if (request.getDate() == null || request.getDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "date is required (yyyy-MM-dd)"));
            }
            if (request.getSlots() == null || request.getSlots().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "slots are required"));
            }

            // Create booking with CONFIRMED status (hardcoded)
            String bookingId = bookingService.createBooking(
                    request.getPartnerId().trim(),
                    request.getUserId().trim(),
                    request.getVenueId().trim(),
                    request.getSlots(),
                    request.getDate().trim()
            );

            return ResponseEntity.ok(new ApiResponse(true, "Booking created successfully", bookingId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error creating booking: " + e.getMessage()));
        }
    }

    @GetMapping("/user/mobile/{mobileNumber}")
    public ResponseEntity<ApiResponse> getBookingsByMobileNumber(@PathVariable String mobileNumber) {
        try {
            if (mobileNumber == null || mobileNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Mobile number is required"));
            }

            // Format phone number (ensure it starts with +)
            String phoneNumber = mobileNumber.trim();
            List<BookingItemResponse> bookings = bookingService.getUserBookingsByMobileNumber(phoneNumber);
            return ResponseEntity.ok(new ApiResponse(true, "Bookings retrieved successfully", bookings));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error fetching bookings: " + e.getMessage()));
        }
    }
}


