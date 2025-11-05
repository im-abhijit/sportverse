package co.sportverse.sportverse_backend.service;

import co.sportverse.sportverse_backend.dto.CreateSlotsRequest;
import co.sportverse.sportverse_backend.entity.TimeSlot;
import co.sportverse.sportverse_backend.entity.VenueSlots;
import co.sportverse.sportverse_backend.repository.SlotsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SlotsService {

    @Autowired
    private SlotsRepository slotsRepository;

    public VenueSlots createSlots(CreateSlotsRequest request) {
        if (request.getVenueId() == null || request.getVenueId().trim().isEmpty()) {
            throw new IllegalArgumentException("venueId is required");
        }
        if (request.getDate() == null || request.getDate().trim().isEmpty()) {
            throw new IllegalArgumentException("date is required (yyyy-MM-dd)");
        }
        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new IllegalArgumentException("slots are required");
        }

        // Prevent duplicates per venue/date
        VenueSlots existing = slotsRepository.findByVenueIdAndDate(request.getVenueId(), request.getDate());
        if (existing != null) {
            throw new IllegalStateException("Slots already exist for this venue and date");
        }

        java.util.List<TimeSlot> timeSlots = new java.util.ArrayList<>();
        for (CreateSlotsRequest.SlotDto s : request.getSlots()) {
            timeSlots.add(new TimeSlot(s.getSlotId(), s.getStartTime(), s.getEndTime(), s.getPrice(), s.isBooked()));
        }

        VenueSlots venueSlots = new VenueSlots(request.getVenueId(), request.getDate(), timeSlots);
        return slotsRepository.save(venueSlots);
    }

    public VenueSlots getSlotsByVenueAndDate(String venueId, String date) {
        if (venueId == null || venueId.trim().isEmpty()) {
            throw new IllegalArgumentException("venueId is required");
        }
        if (date == null || date.trim().isEmpty()) {
            throw new IllegalArgumentException("date is required (yyyy-MM-dd)");
        }
        return slotsRepository.findByVenueIdAndDate(venueId.trim(), date.trim());
    }
}


