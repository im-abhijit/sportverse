import { API_BASE_URL } from "@/config/api";

export interface UploadTokenResponse {
  token: string;
  expire: string;
  signature: string;
}

/**
 * Get upload token from backend for ImageKit upload
 * Endpoint: POST /api/imagekit/upload-token
 * Returns: { token, expire, signature }
 */
export async function getUploadToken(): Promise<UploadTokenResponse> {
  const url = `${API_BASE_URL}/api/imagekit/upload-token`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = `HTTP ${res.status}: ${text.slice(0, 200)}`;
    
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.error || errorData.message || errorMessage;
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

  const data = await res.json();
  
  // Validate response structure
  if (!data.token || !data.expire || !data.signature) {
    throw new Error("Invalid upload token response: missing required fields");
  }

  return data;
}
