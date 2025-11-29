import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { partnerLogin } from "@/services/authApi";
import { initializePushNotifications } from "@/services/pushNotificationService";

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const partnerId = localStorage.getItem("partnerId");
    const isPartnerLoggedIn = localStorage.getItem("isPartnerLoggedIn");
    
    if (partnerId && isPartnerLoggedIn === "true") {
      navigate("/partner/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerId.trim() || !password.trim()) {
      toast.error("Please enter both Partner ID and Password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await partnerLogin(partnerId.trim(), password.trim());

      if (response.success) {
        // Store partner session
        const loggedInPartnerId = response.partnerId || partnerId;
        localStorage.setItem("partnerId", loggedInPartnerId);
        localStorage.setItem("isOwnerLoggedIn", "true");
        localStorage.setItem("isPartnerLoggedIn", "true");
        
        toast.success(response.message || "Login successful!");
        
        // Initialize push notifications in the background
        // Don't block navigation if this fails
        initializePushNotifications(loggedInPartnerId)
          .then((success) => {
            if (success) {
              console.log("Push notifications initialized successfully");
            } else {
              console.warn("Push notifications initialization returned false");
            }
          })
          .catch((error) => {
            console.error("Failed to initialize push notifications:", error);
            // Show error in console for debugging
          });
        
        navigate("/partner/dashboard");
      } else {
        toast.error(response.message || "Invalid credentials. Please check your Partner ID and Password.");
      }
          } catch (error: any) {
            toast.error(error.message || "Login failed. Please try again.");
          } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 gradient-primary rounded-xl px-4 py-2 w-fit">
            <span className="text-xl font-bold text-primary-foreground">Sportverse</span>
          </div>
          <CardTitle className="text-2xl font-bold">Venue Owner Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerId">Partner ID</Label>
              <Input
                id="partnerId"
                type="text"
                placeholder="Enter your Partner ID"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerLogin;

