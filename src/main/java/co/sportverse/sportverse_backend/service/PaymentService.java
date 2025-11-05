package co.sportverse.sportverse_backend.service;

import co.sportverse.sportverse_backend.config.RazorpayConfig;
import co.sportverse.sportverse_backend.repository.BookingRepository;
import co.sportverse.sportverse_backend.entity.BookingStatus;
import co.sportverse.sportverse_backend.entity.PaymentStatus;
import co.sportverse.sportverse_backend.repository.SlotsRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.bson.Document;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotsRepository slotsRepository;

    private RazorpayClient client() throws RazorpayException {
        return new RazorpayClient(razorpayConfig.getKey_id(), razorpayConfig.getKey_secret());
    }

    public Map<String, Object> createOrder(int amountInRupees, String userId, String venueId, java.util.List<String> slotIds, String date) {
        try {
            int amountInPaise = amountInRupees * 100;
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            String slotsPart = (slotIds != null && !slotIds.isEmpty()) ? String.join(",", slotIds) : "no-slots";
            orderRequest.put("receipt", venueId + ":" + slotsPart + ":" + date);

            Order order = client().orders.create(orderRequest);

            String orderId = order.get("id");
            int amount = order.get("amount");
            String currency = order.get("currency");

            // Create booking document with INITIATED status and pending payment
            try {
                bookingRepository.createBooking(userId, venueId, slotIds, date, amountInRupees, orderId);
            } catch (Exception e) {
                // Best effort: booking creation failed, surface clear error
                throw new RuntimeException("Failed to persist booking: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("key", razorpayConfig.getKey_id());
            response.put("orderId", orderId);
            response.put("amount", amount);
            response.put("currency", currency);
            return response;
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + '|' + paymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(razorpayConfig.getKey_secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hashBytes = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = new String(Base64.getEncoder().encode(hashBytes));
            // Razorpay expects hex string, not base64. Convert to hex
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String expected = hexString.toString();
            return expected.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean verifyAndUpdate(String orderId, String paymentId, String signature) {
        try {
            // 1️⃣ Fetch booking by Razorpay orderId
            Document booking = bookingRepository.findByRazorpayOrderId(orderId);
            if (booking == null) {
                return false;
            }

            // 2️⃣ Extract payment info
            Document paymentInfo = (Document) booking.get("payment");
            if (paymentInfo == null) {
                return false;
            }

            String storedOrderId = paymentInfo.getString("razorpayOrderId");

            // 3️⃣ Verify Razorpay signature
            boolean isValid = verifySignature(storedOrderId, paymentId, signature);

            // 4️⃣ Update payment and booking status
            PaymentStatus paymentStatus = isValid ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            BookingStatus bookingStatus = isValid ? BookingStatus.PAID : BookingStatus.FAILED;

            bookingRepository.updatePaymentByOrderId(orderId, paymentStatus, paymentId, signature, bookingStatus);

            // 5️⃣ If valid, mark slots as booked
            if (isValid) {
                String venueId = booking.getObjectId("venueId").toString();
                String date = booking.getString("date");
                @SuppressWarnings("unchecked")
                List<String> slotIds = (List<String>) booking.get("slotIds");

                if (venueId != null && date != null && slotIds != null && !slotIds.isEmpty()) {
                    slotsRepository.markSlotsBooked(venueId, date, slotIds);
                }
            }

            return isValid;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}


