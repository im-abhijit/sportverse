import React, { useState, useEffect } from "react";
import { X, ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OTPInput from "@/components/ui/otp-input";
import { toast } from "sonner";
import { generateOtp, verifyOtp } from "@/services/authApi";
import NamePromptModal from "./NamePromptModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "venue";
  onLoginSuccess?: () => void;
  redirectOnSuccessTo?: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onLoginSuccess,
  redirectOnSuccessTo = "/dashboard",
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "venue">(initialMode);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setResendTimer(0);
      setMode(initialMode);
      setShowNamePrompt(false);
      setVerifiedUserId(null);
    }
  }, [isOpen, initialMode]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    
    try {
      // Send only the 10-digit phone number without country code
      const response = await generateOtp(phoneNumber, "sms");
      
      if (response.success) {
        setStep("otp");
        setMaskedPhone(`${phoneNumber.slice(0, 3)}XXXXX${phoneNumber.slice(-3)}`);
        setResendTimer(30);
        toast.success("OTP sent successfully!");
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    
    try {
      // Send only the 10-digit phone number without country code
      const response = await verifyOtp(phoneNumber, otp);
      
      if (response.success && response.valid) {
        toast.success("Login successful!");
        // Set login status in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        // Persist returned user details for future API calls
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
          setVerifiedUserId(response.userId);
        }
        if (response.userName) {
          localStorage.setItem('userName', response.userName);
        }
        // Store phone number for profile display (only 10 digits, no country code)
        localStorage.setItem('userPhoneNumber', phoneNumber);
        
        // Check if userName matches pattern user_xxxx where xxxx is last 4 digits
        const lastFourDigits = phoneNumber.slice(-4);
        const defaultPattern = `user_${lastFourDigits}`;
        const userName = (response.userName || '').trim();
        
        console.log('[AuthModal] Checking username pattern:', {
          userName,
          defaultPattern,
          matches: userName === defaultPattern,
          phoneNumber,
          lastFourDigits,
          userNameLength: userName.length,
          patternLength: defaultPattern.length
        });
        
        // Check if userName matches the default pattern (case-insensitive, trimmed)
        if (userName.toLowerCase() === defaultPattern.toLowerCase()) {
          // Show name prompt modal - don't close AuthModal yet
          console.log('[AuthModal] Showing name prompt modal');
          setShowNamePrompt(true);
          // Don't close the auth modal or navigate yet - wait for name prompt to complete
        } else {
          // Normal flow - notify parent and close
          onLoginSuccess?.();
          onClose();
          if (redirectOnSuccessTo) {
            navigate(redirectOnSuccessTo);
          }
        }
      } else {
        toast.error(response.message || "Invalid OTP. Please try again.");
        // Clear any stale user info on failure
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhoneNumber');
        setOtp("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      // Send only the 10-digit phone number without country code
      const response = await generateOtp(phoneNumber, "sms");
      
      if (response.success) {
        setResendTimer(30);
        toast.success("OTP resent successfully!");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setResendTimer(0);
  };

  const handleNamePromptSuccess = () => {
    setShowNamePrompt(false);
    onLoginSuccess?.();
    onClose();
    if (redirectOnSuccessTo) {
      navigate(redirectOnSuccessTo);
    }
  };

  return (
    <>
    <Dialog open={isOpen && !showNamePrompt} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="gradient-primary rounded-xl px-4 py-2">
              <span className="text-2xl font-bold text-primary-foreground">
                SportVerse
              </span>
            </div>
          </div>
          <DialogTitle className="text-lg text-muted-foreground">
            Book or List Your Sports Venue Instantly 🏏⚽🏸
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "phone" ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Enter your phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full mt-2"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit OTP sent to {maskedPhone}
                  </p>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  />
                </div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    {showNamePrompt && verifiedUserId && (
      <NamePromptModal
        isOpen={showNamePrompt}
        userId={verifiedUserId}
        phoneNumber={phoneNumber}
        onSuccess={handleNamePromptSuccess}
      />
    )}
    </>
  );
};

export default AuthModal;

