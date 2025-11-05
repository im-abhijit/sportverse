import { API_BASE_URL } from "@/config/api";

export interface CreateOrderBody {
  amount: number; // amount in rupees; backend may convert to paise
  userId: string;
  venueId: string;
  slotIds: string[];
  date: string; // yyyy-MM-dd
}

export interface CreateOrderData {
  key: string;
  orderId: string;
  amount: number; // typically in paise from gateway
  currency: string; // e.g., INR
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function createOrder(
  amount: number,
  userId: string,
  venueId: string,
  slotIds: string[],
  date: string
): Promise<ApiResponse<CreateOrderData>> {
  const url = `${API_BASE_URL}/api/payments/create-order`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ amount, userId, venueId, slotIds, date } satisfies CreateOrderBody),
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


export interface VerifySignatureBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function verifySignature(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<ApiResponse> {
  const url = `${API_BASE_URL}/api/payments/verify`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    } satisfies VerifySignatureBody),
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


