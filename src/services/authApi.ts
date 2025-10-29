// API service for OTP authentication
const API_BASE_URL = "https://mesothelial-sonya-deferentially.ngrok-free.dev";

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
    console.error("Error generating OTP:", error);
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
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP. Please try again.");
  }
};
