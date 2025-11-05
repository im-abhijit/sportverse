package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.ApiResponse;
import co.sportverse.sportverse_backend.dto.CreatePaymentOrderRequest;
import co.sportverse.sportverse_backend.dto.VerifyPaymentRequest;
import co.sportverse.sportverse_backend.repository.BookingRepository;
import co.sportverse.sportverse_backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse> createOrder(@RequestBody CreatePaymentOrderRequest request) {
        try {
            if (request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Amount must be > 0"));
            }
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "userId is required"));
            }
            if (request.getVenueId() == null || request.getVenueId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "venueId is required"));
            }
            if (request.getSlotIds() == null || request.getSlotIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "slotIds are required"));
            }
            if (request.getDate() == null || request.getDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "date is required (yyyy-MM-dd)"));
            }

            Map<String, Object> orderData = paymentService.createOrder(
                    request.getAmount(),
                    request.getUserId(),
                    request.getVenueId(),
                    request.getSlotIds(),
                    request.getDate()
            );
            return ResponseEntity.ok(new ApiResponse(true, "Order created", orderData));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error creating order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(@RequestBody VerifyPaymentRequest request) {
        try {
            if (request.getRazorpay_order_id() == null || request.getRazorpay_order_id().trim().isEmpty() ||
                request.getRazorpay_payment_id() == null || request.getRazorpay_payment_id().trim().isEmpty() ||
                request.getRazorpay_signature() == null || request.getRazorpay_signature().trim().isEmpty()){
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Missing required fields"));
            }

            boolean valid = paymentService.verifyAndUpdate(
                request.getRazorpay_order_id(),
                request.getRazorpay_payment_id(),
                request.getRazorpay_signature()
            );

            if (valid) return ResponseEntity.ok(new ApiResponse(true, "Payment verified", null));
            return ResponseEntity.ok(new ApiResponse(false, "Invalid signature", null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error verifying payment: " + e.getMessage()));
        }
    }

}