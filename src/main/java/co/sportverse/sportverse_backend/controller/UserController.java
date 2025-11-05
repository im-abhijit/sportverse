package co.sportverse.sportverse_backend.controller;

import co.sportverse.sportverse_backend.dto.ApiResponse;
import co.sportverse.sportverse_backend.dto.UpdateUserDetailsRequest;
import co.sportverse.sportverse_backend.entity.User;
import co.sportverse.sportverse_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse> updateUser(@RequestBody UpdateUserDetailsRequest request) {
        try {
            if (request.getMobileNumber() == null || request.getMobileNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "mobileNumber is required"));
            }

            User updated = userService.updateUserByMobileNumber(
                    request.getMobileNumber().trim(),
                    request.getName().trim(),
                    request.getCity().trim()
            );

            if (updated == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found for given mobile number"));
            }

            return ResponseEntity.ok(new ApiResponse(true, "User updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Error updating user: " + e.getMessage()));
        }
    }
}



