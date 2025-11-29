/**
 * VAPID (Voluntary Application Server Identification) utilities
 * Following the Web Push Protocol specification
 */

/**
 * Convert a base64url encoded VAPID public key to Uint8Array
 * This is required for the Push API's applicationServerKey parameter
 * 
 * According to VAPID spec:
 * - The public key must be passed as Uint8Array
 * - Format: const publicKey = new Uint8Array([0x4, 0x37, 0x77, 0xfe, …. ]);
 * 
 * @param base64urlKey - Base64url encoded VAPID public key
 * @returns Uint8Array representation of the key
 */
export function urlBase64ToUint8Array(base64urlKey: string): Uint8Array {
  // Add padding if needed (base64url doesn't require padding, but some implementations do)
  const padding = '='.repeat((4 - (base64urlKey.length % 4)) % 4);
  const base64 = base64urlKey.replace(/-/g, '+').replace(/_/g, '/') + padding;
  
  // Convert base64 to binary string
  const rawData = atob(base64);
  
  // Convert binary string to Uint8Array
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Get the VAPID public key as Uint8Array for use with Push API
 * This follows the VAPID specification for subscribing with applicationServerKey
 */
export function getVAPIDPublicKeyAsUint8Array(vapidKey: string): Uint8Array {
  return urlBase64ToUint8Array(vapidKey);
}

/**
 * Verify that a subscription endpoint is using FCM (Firebase Cloud Messaging)
 * According to VAPID spec, if the endpoint origin is fcm.googleapis.com, it's working
 * 
 * @param endpoint - The push subscription endpoint URL
 * @returns true if the endpoint is an FCM endpoint
 */
export function isFCMEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.origin === 'https://fcm.googleapis.com';
  } catch {
    return false;
  }
}

