import { useState } from "react";
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
import { X, Upload, Plus } from "lucide-react";
import { toast } from "sonner";

// Keep in sync with authApi.ts base URL
const API_BASE_URL = "https://mesothelial-sonya-deferentially.ngrok-free.dev";

const availableSports = ["Cricket", "Badminton"];

const ListVenue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    games: [""],
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.address || !formData.city) {
      toast.error("Please fill in all required fields");
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

      const body = {
        name: formData.name,
        description: formData.description,
        games: validGames,
        // keep backend compatibility: send combined location
        location: `${formData.address}, ${formData.city}`,
        city: formData.city,
        photos: base64Photos,
      };

      const userId = localStorage.getItem("userId");

      const res = await fetch(`${API_BASE_URL}/api/venues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "X-User-Id": userId } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.success) {
        toast.success(data?.message || "Venue submitted successfully!");
        navigate("/dashboard");
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


