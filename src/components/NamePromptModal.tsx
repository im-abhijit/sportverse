import React, { useState, useEffect } from "react";
import { Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateUserProfile } from "@/services/usersApi";

interface NamePromptModalProps {
  isOpen: boolean;
  userId: string;
  phoneNumber: string;
  onSuccess: () => void;
}

const NamePromptModal: React.FC<NamePromptModalProps> = ({
  isOpen,
  userId,
  phoneNumber,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Debug log
  useEffect(() => {
    if (isOpen) {
      console.log('[NamePromptModal] Modal opened', { userId, phoneNumber });
    }
  }, [isOpen, userId, phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Use city from localStorage if available, otherwise use empty string or prompt
    const userCity = city.trim() || localStorage.getItem("userCity") || "";

    setIsSaving(true);
    try {
      const resp = await updateUserProfile(
        userId,
        name.trim(),
        userCity || "Unknown", // Fallback to "Unknown" if no city
        phoneNumber
      );
      
      if (resp.success) {
        localStorage.setItem("userName", name.trim());
        if (userCity) {
          localStorage.setItem("userCity", userCity);
        }
        toast.success("Welcome! Your name has been saved.");
        onSuccess();
      } else {
        toast.error(resp.message || "Failed to save name");
      }
    } catch (error: any) {
      toast.error(error?.message || "Could not save name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to SportVerse! 🎉
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Let's personalize your experience. What should we call you?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Your City (Optional)
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter your city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full"
              disabled={isSaving}
            />
          </div>

          <Button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            {isSaving ? "Saving..." : "Let's Go! 🚀"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NamePromptModal;

