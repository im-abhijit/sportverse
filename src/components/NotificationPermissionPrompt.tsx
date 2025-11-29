import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertCircle } from "lucide-react";
import { initializePushNotifications } from "@/services/pushNotificationService";
import { toast } from "sonner";

/**
 * Component to prompt user to enable push notifications
 * Shows when permission is denied or not granted
 */
const NotificationPermissionPrompt = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
      
      // Check if user previously dismissed this prompt
      const dismissed = localStorage.getItem("notificationPromptDismissed");
      if (dismissed === "true" && Notification.permission === "default") {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const partnerId = localStorage.getItem("partnerId");
      if (!partnerId) {
        toast.error("Please login first");
        return;
      }

      const success = await initializePushNotifications(partnerId);
      if (success) {
        toast.success("Push notifications enabled!");
        setPermissionStatus("granted");
        setIsDismissed(false);
        localStorage.removeItem("notificationPromptDismissed");
      } else {
        if (Notification.permission === "denied") {
          toast.error("Permission denied. Please enable notifications in browser settings.");
        } else {
          toast.error("Failed to enable push notifications");
        }
        setPermissionStatus(Notification.permission);
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  // Don't show if permission is granted or if dismissed
  if (permissionStatus === "granted" || isDismissed) {
    return null;
  }

  // Don't show if notifications are not supported
  if (!("Notification" in window)) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Enable Push Notifications</CardTitle>
              <CardDescription className="mt-1">
                Get notified instantly when you receive new bookings
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {permissionStatus === "denied" ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-orange-100 p-3 dark:bg-orange-900/20">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  Notifications are blocked
                </p>
                <p className="mt-1 text-orange-700 dark:text-orange-300">
                  To enable notifications, please reset permissions in your browser settings:
                </p>
                <ul className="mt-2 ml-4 list-disc space-y-1 text-orange-700 dark:text-orange-300">
                  <li>
                    <strong>Chrome/Edge:</strong> Click the lock icon in address bar → Site settings → Notifications → Allow
                  </li>
                  <li>
                    <strong>Firefox:</strong> Click the lock icon → More Information → Permissions → Notifications → Allow
                  </li>
                  <li>
                    <strong>Safari:</strong> Safari → Settings → Websites → Notifications → Find this site → Allow
                  </li>
                </ul>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open("https://support.google.com/chrome/answer/3220216", "_blank");
              }}
            >
              Learn More
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? "Enabling..." : "Enable Notifications"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPermissionPrompt;

