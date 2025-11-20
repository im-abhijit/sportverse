import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { X, Upload, Plus, Zap, Car } from "lucide-react";
import { toast } from "sonner";

import { API_BASE_URL } from "@/config/api";

const availableSports = ["Cricket", "Badminton"];

const ListVenue = () => {
  const navigate = useNavigate();
  
  // Check authentication on mount
  useEffect(() => {
    const partnerId = localStorage.getItem("partnerId");
    const isPartnerLoggedIn = localStorage.getItem("isPartnerLoggedIn");
    
    if (!partnerId || isPartnerLoggedIn !== "true") {
      toast.error("Please login to access this page");
      navigate("/partner/login");
      return;
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    games: [""],
    amenities: ["Flood Lights", "Parking"],
    whatsappNumber: "",
    upiId: "",
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGameChange = (index: number, value: string) => {
    const newGames = [...formData.games];
    newGames[index] = value;
    setFormData((prev) => ({ ...prev, games: newGames }));
  };

  const addGameField = () => {
    setFormData((prev) => ({ ...prev, games: [...prev.games, ""] }));
  };

  const removeGameField = (index: number) => {
    if (formData.games.length > 1) {
      const newGames = formData.games.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, games: newGames }));
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      const trimmedAmenity = newAmenity.trim();
      // Check if amenity already exists
      if (formData.amenities.includes(trimmedAmenity)) {
        toast.error("This amenity already exists");
        return;
      }
      setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, trimmedAmenity] }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, amenities: newAmenities }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos = [...photos, ...files].slice(0, 3);
      setPhotos(newPhotos);
      const previews = newPhotos.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrCodeImage(file);
      const preview = URL.createObjectURL(file);
      setQrCodePreview(preview);
    }
  };

  const removeQrCode = () => {
    setQrCodeImage(null);
    if (qrCodePreview) {
      URL.revokeObjectURL(qrCodePreview);
    }
    setQrCodePreview(null);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.address || !formData.city || !formData.whatsappNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate WhatsApp number (should be at least 10 digits)
    const cleanWhatsApp = formData.whatsappNumber.replace(/\D/g, "");
    if (cleanWhatsApp.length < 10) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    const validGames = formData.games.filter((g) => g.trim());
    if (validGames.length === 0) {
      toast.error("Please add at least one game");
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Photos = await Promise.all(photos.map((p) => fileToBase64(p)));
      const base64QrCode = qrCodeImage ? await fileToBase64(qrCodeImage) : null;

      const partnerId = localStorage.getItem("partnerId");

      // Clean WhatsApp number (remove spaces, keep only digits and +)
      const cleanWhatsApp = formData.whatsappNumber.trim().replace(/\s+/g, "");
      
      const body = {
        name: formData.name,
        description: formData.description,
        games: validGames,
        amenities: formData.amenities,
        // keep backend compatibility: send combined location
        location: `${formData.address}, ${formData.city}`,
        city: formData.city,
        photos: base64Photos,
        partnerMobileNo: cleanWhatsApp,
        ...(base64QrCode ? { qrCodeImage: base64QrCode } : {}),
        ...(formData.upiId ? { upiId: formData.upiId.trim() } : {}),
        ...(partnerId ? { partnerId } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/api/venues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.success) {
        toast.success(data?.message || "Venue submitted successfully!");
        navigate("/partner/dashboard");
      } else {
        toast.error(data?.message || "Failed to submit venue");
      }
    } catch (err) {
      toast.error("Failed to create venue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">List Your Venue</h1>
            <p className="text-muted-foreground">Share your sports venue with the community</p>
          </div>

          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Venue Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Elite Sports Arena"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your venue, facilities, and amenities..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-2 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-base font-semibold">
                  Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street, Area, Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-base font-semibold">
                  City *
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g., Mumbai"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber" className="text-base font-semibold">
                  WhatsApp Number for Booking Verification *
                </Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This number will be used for booking verification and payment screenshots
                </p>
              </div>

              <div>
                <Label htmlFor="upiId" className="text-base font-semibold">
                  UPI ID
                </Label>
                <Input
                  id="upiId"
                  name="upiId"
                  type="text"
                  placeholder="e.g., yourname@paytm"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  UPI ID for receiving payments
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold">QR Code Image</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Upload QR code for payment</p>
                {qrCodePreview ? (
                  <div className="relative group">
                    <img 
                      src={qrCodePreview} 
                      alt="QR Code" 
                      className="w-full max-w-xs h-48 object-contain rounded-lg border" 
                    />
                    <button
                      type="button"
                      onClick={removeQrCode}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 max-w-xs border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload QR Code</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleQrCodeChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold">Sports/Games Available *</Label>
                <div className="mt-2 space-y-3">
                  {formData.games.map((game, index) => (
                    <div key={index} className="flex gap-2">
                      <Select onValueChange={(value) => handleGameChange(index, value)}>
                        <SelectTrigger className="w-full h-12 rounded-2xl">
                          <SelectValue placeholder="Select a sport/game" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSports.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.games.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeGameField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGameField}
                    disabled={formData.games.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Another Game
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Add up to 5 games</p>
              </div>

              <div>
                <Label className="text-base font-semibold">Amenities</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Add amenities available at your venue</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.amenities.map((amenity, index) => {
                    // Map common amenities to icons
                    const getIcon = (name: string) => {
                      const lowerName = name.toLowerCase();
                      if (lowerName.includes("light") || lowerName.includes("flood")) {
                        return <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                      }
                      if (lowerName.includes("parking") || lowerName.includes("car")) {
                        return <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                      }
                      return null;
                    };

                    return (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {getIcon(amenity)}
                        {amenity}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAmenity(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="Add an amenity (e.g., WiFi, Changing Rooms)"
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" onClick={handleAddAmenity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Photos</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Upload up to 3 photos</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Venue ${index + 1}`} className="w-full h-48 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" multiple />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Venue"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListVenue;


