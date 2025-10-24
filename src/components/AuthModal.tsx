import React, { useState, useEffect } from "react";
import { X, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OTPInput from "@/components/ui/otp-input";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "venue";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "venue">(initialMode);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setResendTimer(0);
      setMode(initialMode);
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
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setMaskedPhone(`${countryCode} ${phoneNumber.slice(0, 3)}XXXXX${phoneNumber.slice(-3)}`);
      setResendTimer(30);
      toast.success("OTP sent successfully!");
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") { // Demo OTP
        toast.success("Login successful!");
        onClose();
        // Redirect based on mode
        if (mode === "venue") {
          window.location.href = "/owner";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        toast.error("Invalid OTP. Please try again.");
        setOtp("");
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResendTimer(30);
      toast.success("OTP resent successfully!");
    }, 1000);
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setResendTimer(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  <div className="flex gap-2 mt-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="flex-1"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length < 10}
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

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Demo OTP: <span className="font-mono font-semibold">123456</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
