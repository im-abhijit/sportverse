const API_BASE_URL = "https://sportverse-477004.el.r.appspot.com";

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
  price: number;
  booked?: boolean;
  isBooked?: boolean;
}

export interface BookingResponse {
  id: string;
  venue: BookingVenueResponse;
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
  amount: number;
  bookingStatus?: string; // e.g., PAID/CANCELLED
  paymentStatus?: string; // e.g., SUCCESS/FAILED
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


