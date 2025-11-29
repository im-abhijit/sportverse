/**
 * Push Notification Service using VAPID
 * Following Web Push Protocol specification with VAPID
 * 
 * This service handles:
 * - Requesting notification permission
 * - Registering service worker
 * - Subscribing to push notifications with VAPID public key
 * - Sending subscription to backend
 */

import { API_BASE_URL } from "@/config/api";
import { getVAPIDPublicKeyAsUint8Array, isFCMEndpoint } from "@/utils/vapidUtils";
import { VAPID_PUBLIC_KEY } from "@/config/pushNotifications";

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("[Push Notifications] This browser does not support notifications");
    return false;
  }

  console.log("[Push Notifications] Current permission status:", Notification.permission);

  if (Notification.permission === "granted") {
    console.log("[Push Notifications] Permission already granted");
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("[Push Notifications] Notification permission was denied. User must enable it in browser settings.");
    console.warn("[Push Notifications] To reset: Chrome/Edge - Click lock icon → Site settings → Notifications → Allow");
    return false;
  }

  try {
    console.log("[Push Notifications] Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("[Push Notifications] Permission result:", permission);
    return permission === "granted";
  } catch (error) {
    console.error("[Push Notifications] Error requesting notification permission:", error);
    return false;
  }
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.error("[Push Notifications] Service workers are not supported");
    return null;
  }

  try {
    console.log("[Push Notifications] Registering service worker at /sw.js...");
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("[Push Notifications] Service Worker registered successfully:", registration);
    console.log("[Push Notifications] Service Worker scope:", registration.scope);
    console.log("[Push Notifications] Service Worker state:", registration.active?.state || registration.installing?.state || registration.waiting?.state);
    return registration;
  } catch (error) {
    console.error("[Push Notifications] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Subscribe to push notifications using VAPID
 * Following VAPID spec: subscribe with applicationServerKey as Uint8Array
 * 
 * @param registration - Service worker registration
 * @param vapidPublicKey - VAPID public key (base64url encoded)
 * @returns PushSubscription object or null if subscription fails
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  // Use provided key or fall back to config
  const keyToUse = vapidPublicKey || VAPID_PUBLIC_KEY;
  
  if (keyToUse === "YOUR_VAPID_PUBLIC_KEY_BASE64URL") {
    console.error("[Push Notifications] VAPID public key not configured. Please set VAPID_PUBLIC_KEY in config/pushNotifications.ts");
    return null;
  }
  
  if (!("PushManager" in window)) {
    console.error("[Push Notifications] Push messaging is not supported");
    return null;
  }
  
  console.log("[Push Notifications] Attempting to subscribe with VAPID key...");

  try {
    // Convert VAPID public key to Uint8Array as per VAPID specification
    // The spec requires: const publicKey = new Uint8Array([0x4, 0x37, 0x77, 0xfe, …. ]);
    const applicationServerKey = getVAPIDPublicKeyAsUint8Array(keyToUse);
    
    // Subscribe with VAPID public key
    // Following VAPID spec:
    // serviceWorkerRegistration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: publicKey (as Uint8Array)
    // })
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Required for Chrome
      // @ts-expect-error - Uint8Array is valid for applicationServerKey per VAPID spec
      applicationServerKey: applicationServerKey, // VAPID public key as Uint8Array
    });

    // Verify subscription endpoint
    // According to VAPID spec: if endpoint origin is fcm.googleapis.com, it's working
    if (subscription.endpoint) {
      const isFCM = isFCMEndpoint(subscription.endpoint);
      console.log("[Push Notifications] ✅ Push subscription created successfully");
      console.log("[Push Notifications] Subscription details:", {
        endpoint: subscription.endpoint,
        isFCM: isFCM,
        usingVAPID: true,
      });
      
      // Log subscription keys for debugging
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      console.log("[Push Notifications] Subscription has p256dh key:", !!p256dhKey);
      console.log("[Push Notifications] Subscription has auth key:", !!authKey);
      
      if (isFCM) {
        console.log("[Push Notifications] ✓ VAPID subscription successful - using FCM with Web Push Protocol");
      }
    } else {
      console.warn("[Push Notifications] ⚠️ Subscription created but has no endpoint");
    }

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
}

/**
 * Convert PushSubscription to a format suitable for backend storage
 * Returns the endpoint and keys needed for sending push messages
 */
export function subscriptionToJSON(subscription: PushSubscription): {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
} | null {
  if (!subscription) {
    return null;
  }

  try {
    // Get the keys from the subscription
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (!key || !auth) {
      console.error("Subscription keys not available");
      return null;
    }

    // Convert ArrayBuffer to base64url string
    const p256dh = arrayBufferToBase64URL(key);
    const authKey = arrayBufferToBase64URL(auth);

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dh,
        auth: authKey,
      },
    };
  } catch (error) {
    console.error("Error converting subscription to JSON:", error);
    return null;
  }
}

/**
 * Convert ArrayBuffer to base64url string
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Convert to base64, then to base64url
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Register push subscription with backend
 * Sends the subscription details to backend so it can send push messages
 */
export async function registerPushSubscription(
  partnerId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    console.log("[Push Notifications] 📤 Registering push subscription with backend...");
    console.log("[Push Notifications] Partner ID:", partnerId);
    console.log("[Push Notifications] Subscription endpoint:", subscription.endpoint);
    
    const subscriptionData = subscriptionToJSON(subscription);
    if (!subscriptionData) {
      console.error("[Push Notifications] ❌ Failed to convert subscription to JSON");
      return false;
    }

    console.log("[Push Notifications] Subscription data to send:", JSON.stringify(subscriptionData, null, 2));
    console.log("[Push Notifications] API URL:", `${API_BASE_URL}/api/partners/${partnerId}/push-subscription`);

    const response = await fetch(`${API_BASE_URL}/api/partners/${partnerId}/push-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log("[Push Notifications] Backend response status:", response.status);
    console.log("[Push Notifications] Backend response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Push Notifications] ❌ Failed to register push subscription:", errorData);
      console.error("[Push Notifications] Response status text:", response.statusText);
      return false;
    }

    const data = await response.json();
    console.log("[Push Notifications] Backend response data:", JSON.stringify(data, null, 2));
    console.log("[Push Notifications] ✅ Subscription registered successfully:", data.success === true);
    return data.success === true;
  } catch (error) {
    console.error("[Push Notifications] ❌ Error registering push subscription:", error);
    return false;
  }
}

/**
 * Get existing push subscription
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("[Push Notifications] Service worker or PushManager not available");
    return null;
  }

  try {
    console.log("[Push Notifications] Checking for existing push subscription...");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log("[Push Notifications] ✅ Existing subscription found");
      console.log("[Push Notifications] Subscription endpoint:", subscription.endpoint);
    } else {
      console.log("[Push Notifications] ℹ️ No existing subscription found");
    }
    
    return subscription;
  } catch (error) {
    console.error("[Push Notifications] ❌ Error getting push subscription:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getExistingPushSubscription();
    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log("Unsubscribed from push notifications:", result);
      return result;
    }
    return false;
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return false;
  }
}

/**
 * Initialize push notifications for a partner
 * This should be called after partner login
 * 
 * @param partnerId - Partner ID to register subscription for
 * @param vapidPublicKey - VAPID public key (optional, uses default if not provided)
 */
export async function initializePushNotifications(
  partnerId: string,
  vapidPublicKey?: string
): Promise<boolean> {
  console.log("[Push Notifications] Starting initialization for partner:", partnerId);
  
  try {
    // 1. Request permission
    console.log("[Push Notifications] Step 1: Requesting permission...");
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn("[Push Notifications] Notification permission not granted");
      return false;
    }
    console.log("[Push Notifications] Step 1: Permission granted ✓");

    // 2. Register service worker
    console.log("[Push Notifications] Step 2: Registering service worker...");
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn("[Push Notifications] Failed to register service worker");
      return false;
    }
    console.log("[Push Notifications] Step 2: Service worker registered ✓");

    // 3. Check for existing subscription
    console.log("[Push Notifications] Step 3: Checking for existing subscription...");
    let subscription = await getExistingPushSubscription();
    
    // 4. If no existing subscription, create new one
    if (!subscription) {
      console.log("[Push Notifications] Step 4: Creating new subscription...");
      subscription = await subscribeToPush(registration, vapidPublicKey);
      if (!subscription) {
        console.warn("[Push Notifications] Failed to subscribe to push notifications");
        return false;
      }
      console.log("[Push Notifications] Step 4: Subscription created ✓");
    } else {
      console.log("[Push Notifications] Step 4: Using existing subscription ✓");
    }

    // 5. Register subscription with backend
    console.log("[Push Notifications] Step 5: Registering subscription with backend...");
    const registered = await registerPushSubscription(partnerId, subscription);
    if (!registered) {
      console.warn("[Push Notifications] Failed to register push subscription with backend");
      return false;
    }
    console.log("[Push Notifications] Step 5: Subscription registered with backend ✓");

    // Store subscription info in localStorage
    localStorage.setItem("pushSubscriptionRegistered", "true");
    localStorage.setItem("pushSubscriptionPartnerId", partnerId);

    console.log("[Push Notifications] ✓ Push notifications initialized successfully");
    return true;
  } catch (error) {
    console.error("[Push Notifications] Error initializing push notifications:", error);
    return false;
  }
}

