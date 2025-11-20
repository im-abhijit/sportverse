import { API_BASE_URL } from "@/config/api";

export interface SlotDto {
  slotId: string;
  startTime: string;
  endTime: string;
  startTimeAmPm?: string; // AM or PM
  endTimeAmPm?: string; // AM or PM
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

export interface BulkCreateSlotsBody {
  venueId: string;
  date: string; // YYYY-MM-DD
  slots: Array<{
    slotId: string;
    startTime: string; // 12-hour format (e.g., "2:30")
    endTime: string; // 12-hour format (e.g., "3:30")
    startTimeAmPm?: string; // AM or PM for start time
    endTimeAmPm?: string; // AM or PM for end time
    price: number;
    isBooked?: boolean;
  }>;
}

export interface BulkCreateSlotsResponse {
  id: string;
  venueId: string;
  date: string;
  slots: Array<{
    slotId: string;
    startTime: string;
    endTime: string;
    price: number;
    booked: boolean;
  }>;
}

export async function bulkCreateSlots(body: BulkCreateSlotsBody): Promise<ApiResponse<BulkCreateSlotsResponse>> {
  const url = `${API_BASE_URL}/api/slots`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const errorData = await res.json().catch(() => ({ message: text.slice(0, 200) }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function deleteSlot(venueId: string, date: string, slotId: string): Promise<ApiResponse<void>> {
  const url = `${API_BASE_URL}/api/slots?venueId=${encodeURIComponent(venueId)}&date=${encodeURIComponent(date)}&slotId=${encodeURIComponent(slotId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const errorData = await res.json().catch(() => ({ message: text.slice(0, 200) }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // Handle the case where the API returns success: false (slot not found)
  if (!data.success) {
    throw new Error(data.message || "Failed to delete slot");
  }
  return data;
}

