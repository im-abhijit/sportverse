import { API_BASE_URL } from "@/config/api";

export interface VenueDto {
  id?: string;
  name: string;
  description?: string;
  games?: string[];
  amenities?: string[];
  addtress?: string; // backend sample typo
  address?: string;
  photos?: string[];
  thumbnailUrl?: string;
  ownerId?: string;
  city?: string;
  price?: number;
  rating?: number;
  partnerMobileNo?: string;
  qrCodeImage?: string;
  upiId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getVenuesByCity(city: string): Promise<ApiResponse<VenueDto[] | VenueDto>> {
  const res = await fetch(`${API_BASE_URL}/api/venues/city/${encodeURIComponent(city)}` , {
    headers: { 
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    // Try to read text to aid debugging
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text?.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text?.slice(0, 200)}`);
  }
  return res.json();
}

export async function getVenuesByPartner(partnerId: string): Promise<ApiResponse<VenueDto[]>> {
  const res = await fetch(`${API_BASE_URL}/api/venues/partner/${encodeURIComponent(partnerId)}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text?.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON response: ${text?.slice(0, 200)}`);
  }
  return res.json();
}


