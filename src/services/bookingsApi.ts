import { API_BASE_URL } from "@/config/api";

export interface BookingVenueResponse {
  id: string;
  name: string;
  description?: string;
  games?: string[];
  addtress?: string; // backend typo kept for compatibility
  photos?: string[];
  ownerId?: string;
  city?: string;
}

export interface TimeSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  startTimeAmPm?: string; // AM or PM
  endTimeAmPm?: string; // AM or PM
  price: number;
  booked?: boolean;
  isBooked?: boolean;
}

export interface BookingResponse {
  id: string;
  venue: BookingVenueResponse;
  date: string; // YYYY-MM-DD format
  slots: TimeSlot[];
  amount: number;
  bookingStatus?: string; // INITIATED, PAID, or FAILED
  paymentStatus?: string; // PENDING, SUCCESS, or FAILED
  paymentScreenshotUrl?: string; // URL of payment screenshot
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getBookingsByUser(userId: string): Promise<ApiResponse<BookingResponse[]>> {
  const url = `${API_BASE_URL}/api/bookings/user/${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function getBookingsByPartner(partnerId: string): Promise<ApiResponse<BookingResponse[]>> {
  const url = `${API_BASE_URL}/api/bookings/partner/${encodeURIComponent(partnerId)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function getBookingsByUserMobile(mobileNumber: string): Promise<ApiResponse<BookingResponse[]>> {
  // Use mobile number as-is, just trim and remove spaces
  const cleanMobile = mobileNumber.trim().replace(/\s+/g, "");
  
  const url = `${API_BASE_URL}/api/bookings/user/mobile/${encodeURIComponent(cleanMobile)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function confirmBooking(bookingId: string): Promise<ApiResponse<null>> {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  const url = `${API_BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}/confirm`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = `HTTP ${res.status}: ${text.slice(0, 200)}`;
    
    // Try to parse error response
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message
    }
    
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export async function cancelBooking(bookingId: string): Promise<ApiResponse<null>> {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  const url = `${API_BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = `HTTP ${res.status}: ${text.slice(0, 200)}`;
    
    // Try to parse error response
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message
    }
    
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }

  return res.json();
}


