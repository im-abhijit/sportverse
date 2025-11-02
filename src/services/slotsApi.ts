const API_BASE_URL = "https://sportverse-477004.el.r.appspot.com";

export interface SlotDto {
  slotId: string;
  startTime: string;
  endTime: string;
  price: number;
  booked: boolean;
  isBooked?: boolean;
}

export interface SlotsResponse {
  id?: string;
  venueId: string;
  date: string; // YYYY-MM-DD
  slots: SlotDto[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getSlotsByVenueAndDate(venueId: string, date: string): Promise<ApiResponse<SlotsResponse>> {
  const url = `${API_BASE_URL}/api/slots?venueId=${encodeURIComponent(venueId)}&date=${encodeURIComponent(date)}`;
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


