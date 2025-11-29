import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Component to handle push notifications when app is in foreground
 * Listens for messages from service worker and shows toast notifications
 */
const PushNotificationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for messages from service worker (for navigation)
    if ("serviceWorker" in navigator) {
      console.log("[PushNotificationHandler] Setting up message listener from service worker...");
      
      const handleMessage = (event: MessageEvent) => {
        console.log("[PushNotificationHandler] 📨 Message received from service worker");
        console.log("[PushNotificationHandler] Message data:", event.data);
        console.log("[PushNotificationHandler] Message type:", event.data?.type);
        
        if (event.data && event.data.type === "NAVIGATE") {
          const url = event.data.url;
          const data = event.data.data;
          
          console.log("[PushNotificationHandler] Navigating to:", url);
          console.log("[PushNotificationHandler] Navigation data:", data);
          
          // Navigate to the URL
          navigate(url);
          
          // Optionally show a toast with booking details
          if (data && data.type === "new_booking") {
            console.log("[PushNotificationHandler] Showing toast for new booking");
            toast.info("New Booking", {
              description: `Booking for ${data.venueName || "venue"} on ${data.date || ""}`,
              duration: 3000,
            });
          }
        } else {
          console.log("[PushNotificationHandler] Message is not a NAVIGATE type, ignoring");
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);
      console.log("[PushNotificationHandler] ✅ Message listener registered");

      return () => {
        console.log("[PushNotificationHandler] Removing message listener");
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    } else {
      console.warn("[PushNotificationHandler] Service worker not available");
    }
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default PushNotificationHandler;

