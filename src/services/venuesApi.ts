const API_BASE_URL = "https://sportverse-477004.el.r.appspot.com";

export interface VenueDto {
  id?: string;
  name: string;
  description?: string;
  games?: string[];
  addtress?: string; // backend sample typo
  address?: string;
  photos?: string[];
  ownerId?: string;
  city?: string;
  price?: number;
  rating?: number;
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


