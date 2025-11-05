import { API_BASE_URL } from "@/config/api";

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

export interface CreateSlotBody {
  venueId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  price: number;
}

export interface CreateSlotResponse {
  slotId: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export async function createSlot(slot: CreateSlotBody): Promise<ApiResponse<CreateSlotResponse>> {
  const url = `${API_BASE_URL}/api/slots`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(slot),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

