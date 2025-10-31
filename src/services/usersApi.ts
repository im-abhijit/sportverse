const API_BASE_URL = "https://mesothelial-sonya-deferentially.ngrok-free.dev";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface UpdateUserProfileBody {
  userId: string;
  name: string;
  city: string;
  mobileNumber: string;
}

export interface UpdateUserProfileData {
  userId?: string;
  userName?: string;
  city?: string;
}

export async function updateUserProfile(
  userId: string,
  name: string,
  city: string,
  phoneNumber: string
): Promise<ApiResponse<UpdateUserProfileData>> {
  const url = `${API_BASE_URL}/api/users/update`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ userId, name, city, mobileNumber: phoneNumber } satisfies UpdateUserProfileBody),
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


