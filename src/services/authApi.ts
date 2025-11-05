// API service for OTP authentication
import { API_BASE_URL } from "@/config/api";

export interface GenerateOtpRequest {
  phoneNumber: string;
  channel: string;
}

export interface GenerateOtpResponse {
  success: boolean;
  message: string;
  verificationSid: string;
  status: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  status: string;
  valid: boolean;
  userId?: string | null;
  userName?: string | null;
}

export interface PartnerLoginRequest {
  partnerId: string;
  password: string;
}

export interface PartnerLoginResponse {
  success: boolean;
  message: string;
  partnerId?: string;
}

// Generate OTP API call
export const generateOtp = async (phoneNumber: string, channel: string = "sms"): Promise<GenerateOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/generate-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        channel,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to generate OTP. Please try again.");
  }
};

// Verify OTP API call
export const verifyOtp = async (phoneNumber: string, code: string): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to verify OTP. Please try again.");
  }
};

// Partner Login API call
export const partnerLogin = async (
  partnerId: string,
  password: string
): Promise<PartnerLoginResponse> => {
  try {
    // Validate required fields
    if (!partnerId || !partnerId.trim()) {
      throw new Error("Partner ID is required");
    }
    if (!password || !password.trim()) {
      throw new Error("Password is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/partner/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partnerId: partnerId.trim(),
        password: password.trim(),
      }),
    });

    const data = await response.json();

    // Handle different response status codes
    if (response.status === 400) {
      // Bad Request - Missing fields
      throw new Error(data.message || "Invalid request. Please check your input.");
    }

    if (response.status === 500) {
      // Server Error
      throw new Error(data.message || "An error occurred while logging in. Please try again later.");
    }

    // For 200 OK responses, check if login was successful
    if (response.ok && data.success) {
      return data;
    }

    // For 200 OK but success: false (invalid credentials)
    if (response.ok && !data.success) {
      throw new Error(data.message || "Invalid partner ID or password");
    }

    // Fallback for unexpected status codes
    throw new Error(data.message || "Login failed. Please try again.");
  } catch (error) {
    // Re-throw the error message if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed. Please try again.");
  }
};
