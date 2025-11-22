import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Zap, Car, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import { VenueDto } from "@/services/venuesApi";
import { getImageDataUrl } from "@/utils/imageUtils";

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const PartnerVenueDetails = () => {
  const navigate = useNavigate();
  const { venueId } = useParams<{ venueId: string }>();
  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable state
  const [editableName, setEditableName] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [editableCity, setEditableCity] = useState("");
  const [editableGames, setEditableGames] = useState<string[]>([]);
  const [newGame, setNewGame] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (!venueId) {
      toast.error("Venue ID not found");
      navigate("/partner/dashboard");
      return;
    }

    const fetchVenue = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/venues/${venueId}`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const venueData = data.data;
            setVenue(venueData);
            setEditableName(venueData.name || "");
            setEditableDescription(venueData.description || "");
            setEditableAddress(venueData.addtress || venueData.address || "");
            setEditableCity(venueData.city || "");
            setEditableGames(venueData.games || []);
            setPhotos(venueData.photos || []);
            // Initialize amenities - if venue has amenities, use them, otherwise default to common ones
            setAmenities(venueData.amenities || ["Flood Lights", "Parking"]);
            setWhatsappNumber(venueData.partnerMobileNo || "");
            setUpiId(venueData.upiId || "");
            setQrCodeImage(venueData.qrCodeImage || null);
            if (venueData.qrCodeImage) {
              setQrCodePreview(getImageDataUrl(venueData.qrCodeImage) || null);
            }
          } else {
            toast.error(data.message || "Failed to fetch venue details");
            navigate("/partner/dashboard");
          }
        } else {
          toast.error("Failed to fetch venue details");
          navigate("/partner/dashboard");
        }
      } catch (error) {
        toast.error("Failed to load venue details");
        navigate("/partner/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId, navigate]);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await fileToBase64(files[i]);
        newPhotos.push(base64);
      }
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${files.length} photo(s) added`);
    } catch (error) {
      toast.error("Failed to add photos");
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  const handleAddGame = () => {
    if (newGame.trim()) {
      setEditableGames([...editableGames, newGame.trim()]);
      setNewGame("");
    }
  };

  const handleRemoveGame = (index: number) => {
    setEditableGames(editableGames.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      const trimmedAmenity = newAmenity.trim();
      // Check if amenity already exists
      if (amenities.includes(trimmedAmenity)) {
        toast.error("This amenity already exists");
        return;
      }
      setAmenities([...amenities, trimmedAmenity]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleQrCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const base64 = await fileToBase64(file);
      setQrCodeImage(base64);
      setQrCodePreview(URL.createObjectURL(file));
      toast.success("QR code image added");
    } catch (error) {
      toast.error("Failed to add QR code image");
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemoveQrCode = () => {
    setQrCodeImage(null);
    if (qrCodePreview) {
      URL.revokeObjectURL(qrCodePreview);
    }
    setQrCodePreview(null);
    toast.success("QR code image removed");
  };

  const handleSave = async () => {
    if (!venueId) return;

    if (!editableName.trim()) {
      toast.error("Please enter a venue name");
      return;
    }

    if (!editableDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!editableAddress.trim() || !editableCity.trim()) {
      toast.error("Please enter address and city");
      return;
    }

    if (!whatsappNumber.trim()) {
      toast.error("Please enter WhatsApp number");
      return;
    }

    // Validate WhatsApp number (should be at least 10 digits)
    const cleanWhatsApp = whatsappNumber.replace(/\D/g, "");
    if (cleanWhatsApp.length < 10) {
      toast.error("Please enter a valid WhatsApp number (at least 10 digits)");
      return;
    }

    if (editableGames.length === 0) {
      toast.error("Please add at least one game");
      return;
    }

    setSaving(true);
    try {
      const partnerId = localStorage.getItem("partnerId");
      
      // Convert photos to base64 format (same as ListVenue)
      // Photos might already be base64 strings from the API, or data URLs from new uploads
      const base64Photos = photos.map((photo) => {
        // If it's already a data URL (from file upload), convert to base64
        if (photo.startsWith('data:')) {
          // Extract base64 part from data URL
          return photo.split(',')[1] || photo;
        }
        // Already base64 string from API
        return photo;
      });

      // Convert QR code image to base64 format (same as ListVenue)
      let base64QrCode: string | null = null;
      if (qrCodeImage) {
        if (qrCodeImage.startsWith('data:')) {
          // Extract base64 part from data URL
          base64QrCode = qrCodeImage.split(',')[1] || qrCodeImage;
        } else {
          // Already base64 string from API
          base64QrCode = qrCodeImage;
        }
      }
      
      // Clean WhatsApp number (remove spaces, keep only digits and +) - same as ListVenue
      const cleanWhatsApp = whatsappNumber.trim().replace(/\s+/g, "");
      
      // Build body with all values (same structure as ListVenue)
      const body = {
        name: editableName.trim(),
        description: editableDescription.trim(),
        games: editableGames,
        amenities: amenities,
        // keep backend compatibility: send combined location
        location: `${editableAddress.trim()}, ${editableCity.trim()}`,
        city: editableCity.trim(),
        photos: base64Photos,
        partnerMobileNo: cleanWhatsApp,
        ...(base64QrCode ? { qrCodeImage: base64QrCode } : {}),
        ...(upiId.trim() ? { upiId: upiId.trim() } : {}),
        ...(partnerId ? { partnerId } : {}),
        ...(venueId ? { id: venueId, venueId: venueId } : {}), // Include venueId for update
      };

      // Use the same POST endpoint as ListVenue
      const response = await fetch(`${API_BASE_URL}/api/venues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data?.success) {
        toast.success(data?.message || "Venue updated successfully!");
        // Refresh venue data
        const refreshResponse = await fetch(`${API_BASE_URL}/api/venues/${venueId}`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.data) {
            const venueData = refreshData.data;
            setVenue(venueData);
            setWhatsappNumber(venueData.partnerMobileNo || "");
            setUpiId(venueData.upiId || "");
            setQrCodeImage(venueData.qrCodeImage || null);
            if (venueData.qrCodeImage) {
              setQrCodePreview(getImageDataUrl(venueData.qrCodeImage) || null);
            } else {
              if (qrCodePreview) {
                URL.revokeObjectURL(qrCodePreview);
              }
              setQrCodePreview(null);
            }
          }
        }
      } else {
        toast.error(data?.message || "Failed to update venue");
      }
    } catch (error: any) {
      toast.error("Failed to update venue. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return null;
  }

  const venueImages = photos.map((photo) => getImageDataUrl(photo)).filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-green-50/30 dark:from-blue-950/20 dark:via-background dark:to-green-950/20">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/partner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Venue Header - Editable */}
          <Card className="border-2 shadow-lg border-blue-200/50 dark:border-blue-800/50">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="venueName" className="text-sm font-medium text-muted-foreground">
                    Venue Name
                  </Label>
                  <Input
                    id="venueName"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="text-2xl md:text-3xl font-bold mt-1 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent border-none focus-visible:ring-2"
                    placeholder="Enter venue name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Label htmlFor="venueAddress" className="text-sm font-medium text-muted-foreground">
                      Address
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <Input
                        id="venueAddress"
                        value={editableAddress}
                        onChange={(e) => setEditableAddress(e.target.value)}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="venueCity" className="text-sm font-medium text-muted-foreground">
                      City
                    </Label>
                    <Input
                      id="venueCity"
                      value={editableCity}
                      onChange={(e) => setEditableCity(e.target.value)}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description - Editable */}
              <div>
                <Label htmlFor="venueDescription" className="text-lg font-semibold mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="venueDescription"
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  placeholder="Enter venue description"
                  className="min-h-[100px]"
                />
              </div>

              {/* WhatsApp Number and UPI ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsappNumber" className="text-base font-semibold">
                    WhatsApp Number for Booking Verification *
                  </Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g., +91 9876543210"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This number will be used for booking verification
                  </p>
                </div>
                <div>
                  <Label htmlFor="upiId" className="text-base font-semibold">
                    UPI ID
                  </Label>
                  <Input
                    id="upiId"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g., yourname@paytm"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    UPI ID for receiving payments
                  </p>
                </div>
              </div>

              {/* QR Code Image */}
              <div>
                <Label className="text-base font-semibold">QR Code Image</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Upload QR code for payment
                </p>
                {qrCodePreview || qrCodeImage ? (
                  <div className="relative inline-block">
                    <div className="relative w-48 h-48 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-lg overflow-hidden">
                      <img
                        src={qrCodePreview || getImageDataUrl(qrCodeImage || "") || ""}
                        alt="QR Code"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveQrCode}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrCodeChange}
                      className="hidden"
                      id="qr-code-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("qr-code-upload")?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload QR Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Photos Gallery - Editable */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Photos</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                  </div>
                </div>
                {venueImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {venueImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 group"
                      >
                        <img
                          src={image}
                          alt={`${editableName} - Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-4">No photos added yet</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Photo
                    </Button>
                  </div>
                )}
              </div>

              {/* Games - Editable */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Games Available</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editableGames.map((game, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      {game}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveGame(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddGame();
                      }
                    }}
                    placeholder="Add a game"
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={handleAddGame}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Game
                  </Button>
                </div>
              </div>

              {/* Amenities - Editable */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {amenities.map((amenity, index) => {
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
                        handleAddAmenity();
                      }
                    }}
                    placeholder="Add an amenity"
                    className="max-w-xs"
                  />
                  <Button variant="outline" onClick={handleAddAmenity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/partner/edit-venue/${venueId}`)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Manage Slots
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/partner/dashboard")}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerVenueDetails;
