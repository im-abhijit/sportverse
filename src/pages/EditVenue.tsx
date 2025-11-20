import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ArrowLeft, Clock, Save, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSlotsByVenueAndDate, bulkCreateSlots, deleteSlot } from "@/services/slotsApi";

import { API_BASE_URL } from "@/config/api";

interface Venue {
  id?: string;
  venueId?: string;
  name: string;
  address?: string;
  city?: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  slotId?: string;
  price?: number;
  booked?: boolean;
  isBooked?: boolean;
}

const EditVenue = () => {
  const { venueId } = useParams<{ venueId: string }>();
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

  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  
  // New slot form state
  const [newSlotHour, setNewSlotHour] = useState<string>("");
  const [newSlotMinute, setNewSlotMinute] = useState<string>("");
  const [newSlotAmPm, setNewSlotAmPm] = useState<"AM" | "PM">("AM");
  const [newSlotDuration, setNewSlotDuration] = useState<string>("30");
  const [newSlotCustomDuration, setNewSlotCustomDuration] = useState<string>("");
  const [newSlotPrice, setNewSlotPrice] = useState<string>("");
  
  // List of slots to be saved
  const [slotsToSave, setSlotsToSave] = useState<Array<{
    startTime: string;
    endTime: string;
    duration: number;
    price: number;
    id: string;
    displayTime: string; // 12-hour format for display
  }>>([]);

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, amPm: "AM" | "PM"): string => {
    let hourNum = parseInt(hour) || 0;
    const minuteNum = parseInt(minute) || 0;
    
    if (amPm === "AM") {
      if (hourNum === 12) {
        hourNum = 0;
      }
    } else {
      if (hourNum !== 12) {
        hourNum += 12;
      }
    }
    
    return `${String(hourNum).padStart(2, "0")}:${String(minuteNum).padStart(2, "0")}`;
  };

  // Helper function to convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24: string): { hour: string; minute: string; amPm: "AM" | "PM" } => {
    const [hours, minutes] = time24.split(":").map(Number);
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;
    const amPm = hours < 12 ? "AM" : "PM";
    return {
      hour: String(hour12),
      minute: String(minutes).padStart(2, "0"),
      amPm,
    };
  };

  // Helper function to calculate end time from start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!venueId) {
      toast.error("Venue ID not found");
      navigate("/partner/dashboard");
      return;
    }

    // Fetch venue details
    const fetchVenue = async () => {
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
            setVenue(data.data);
          }
        }
      } catch (error) {
        // Error fetching venue
      }
    };

    fetchVenue();
  }, [venueId, navigate]);

  useEffect(() => {
    if (selectedDate && venueId) {
      fetchExistingSlots();
    }
  }, [selectedDate, venueId]);

  const fetchExistingSlots = async () => {
    if (!selectedDate || !venueId) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoadingSlots(true);
    try {
      const response = await getSlotsByVenueAndDate(venueId, dateStr);
      if (response.success && response.data?.slots) {
        const slots = response.data.slots.map((slot: any) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotId: slot.slotId,
          price: slot.price,
          booked: slot.booked || slot.isBooked,
        }));
        setExistingSlots(slots);
      } else {
        setExistingSlots([]);
      }
    } catch (error) {
      setExistingSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Add a new slot to the list
  const handleAddSlot = () => {
    if (!newSlotHour || !newSlotMinute) {
      toast.error("Please enter a start time");
      return;
    }

    const hourNum = parseInt(newSlotHour);
    const minuteNum = parseInt(newSlotMinute);

    if (isNaN(hourNum) || hourNum < 1 || hourNum > 12) {
      toast.error("Please enter a valid hour (1-12)");
      return;
    }

    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      toast.error("Please enter a valid minute (0-59)");
      return;
    }

    const duration = newSlotDuration === "custom" 
      ? parseInt(newSlotCustomDuration) 
      : parseInt(newSlotDuration);

    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    if (!newSlotPrice || parseFloat(newSlotPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Convert to 24-hour format for calculations and API
    const startTime24 = convertTo24Hour(newSlotHour, newSlotMinute, newSlotAmPm);
    const endTime24 = calculateEndTime(startTime24, duration);
    
    // Create display time in 12-hour format
    const displayTime = `${newSlotHour}:${newSlotMinute.padStart(2, "0")} ${newSlotAmPm}`;
    const endTime12 = convertTo12Hour(endTime24);
    const displayEndTime = `${endTime12.hour}:${endTime12.minute} ${endTime12.amPm}`;
    
    const slotId = `${Date.now()}-${Math.random()}`;

    setSlotsToSave((prev) => [
      ...prev,
      {
        startTime: startTime24,
        endTime: endTime24,
        duration,
        price: parseFloat(newSlotPrice),
        id: slotId,
        displayTime: `${displayTime} - ${displayEndTime}`,
      },
    ]);

    // Reset form
    setNewSlotHour("");
    setNewSlotMinute("");
    setNewSlotAmPm("AM");
    setNewSlotDuration("30");
    setNewSlotCustomDuration("");
    setNewSlotPrice("");
  };

  // Remove a slot from the list
  const handleRemoveSlot = (id: string) => {
    setSlotsToSave((prev) => prev.filter((slot) => slot.id !== id));
  };

  // Delete an existing slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!selectedDate || !venueId || !slotId) {
      toast.error("Missing information to delete slot");
      return;
    }

    // Don't allow deleting booked slots
    const slot = existingSlots.find((s) => s.slotId === slotId);
    if (slot && (slot.booked || slot.isBooked)) {
      toast.error("Cannot delete a booked slot");
      return;
    }

    if (!confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    setDeletingSlotId(slotId);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const response = await deleteSlot(venueId, dateStr, slotId);
      if (response.success) {
        toast.success("Slot deleted successfully");
        // Refresh the slots list
        await fetchExistingSlots();
      } else {
        toast.error(response.message || "Failed to delete slot");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete slot. Please try again.");
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleSaveSlots = async () => {
    if (!selectedDate || !venueId) {
      toast.error("Please select a date");
      return;
    }

    if (slotsToSave.length === 0) {
      toast.error("Please add at least one slot to save");
      return;
    }

    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      // Build slots array for the API request
      const slotsForApi = slotsToSave.map((slot) => {
        const slotId = `${slot.startTime}-${slot.endTime}`;
        return {
          slotId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          isBooked: false,
        };
      });

      // Call the bulk create slots API
      const response = await bulkCreateSlots({
        venueId,
        date: dateStr,
        slots: slotsForApi,
      });

      if (response.success) {
        toast.success(response.message || "Slots saved successfully");
        // Clear the slots to save list
        setSlotsToSave([]);
        // Refresh the slots list to show updated data
        await fetchExistingSlots();
      } else {
        toast.error(response.message || "Failed to save slots");
      }
    } catch (error: any) {
      // Handle specific error messages from the API
      const errorMessage = error?.message || "Failed to save slots. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/partner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Venue: {venue?.name || "Loading..."}</CardTitle>
              <CardDescription>
                Add time slots for your venue. Select start time, duration, and price for each slot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Add New Slot Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Add Time Slots for {format(selectedDate, "PPP")}
                  </h3>
                  {loadingSlots && (
                    <p className="text-sm text-muted-foreground">Loading existing slots...</p>
                  )}
                </div>

                {/* Add Slot Form */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Start Time */}
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <div className="flex items-center gap-2">
                          <Select value={newSlotHour} onValueChange={setNewSlotHour}>
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="--" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                <SelectItem key={hour} value={String(hour)}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">:</span>
                          <Select value={newSlotMinute} onValueChange={setNewSlotMinute}>
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="--" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={newSlotAmPm} onValueChange={(value: "AM" | "PM") => setNewSlotAmPm(value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Select value={newSlotDuration} onValueChange={setNewSlotDuration}>
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {newSlotDuration === "custom" && (
                          <Input
                            type="number"
                            min="1"
                            placeholder="Enter minutes"
                            value={newSlotCustomDuration}
                            onChange={(e) => setNewSlotCustomDuration(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                          value={newSlotPrice}
                          onChange={(e) => setNewSlotPrice(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Add Button */}
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          onClick={handleAddSlot}
                          className="w-full"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Slot
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Slots to Save List */}
                {slotsToSave.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Slots to Save ({slotsToSave.length})
                    </Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {slotsToSave.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {slot.displayTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Duration: {slot.duration} minutes • Price: ₹{slot.price}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {slotsToSave.length} slot(s) ready to save
                  </p>
                  <Button
                    onClick={handleSaveSlots}
                    disabled={saving || slotsToSave.length === 0}
                    className="min-w-[120px]"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Slots
                      </>
                    )}
                  </Button>
                </div>

                {/* Existing Slots Display */}
                {!loadingSlots && existingSlots.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-base font-semibold">
                      Existing Slots ({existingSlots.length})
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {existingSlots.map((slot, index) => {
                        const isBooked = slot.booked || slot.isBooked;
                        const isDeleting = deletingSlotId === slot.slotId;
                        const startTime12 = convertTo12Hour(slot.startTime);
                        const endTime12 = convertTo12Hour(slot.endTime);
                        const displayStartTime = `${startTime12.hour}:${startTime12.minute} ${startTime12.amPm}`;
                        const displayEndTime = `${endTime12.hour}:${endTime12.minute} ${endTime12.amPm}`;
                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-2 border rounded text-sm flex items-center justify-between",
                              isBooked
                                ? "bg-muted/50 opacity-60"
                                : "bg-background"
                            )}
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {displayStartTime} - {displayEndTime}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isBooked ? (
                                  <span className="text-destructive">Booked</span>
                                ) : (
                                  <>Price: ₹{slot.price || 0}</>
                                )}
                              </div>
                            </div>
                            {!isBooked && slot.slotId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSlot(slot.slotId!)}
                                disabled={isDeleting}
                                className="ml-2 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {isDeleting ? (
                                  <Clock className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditVenue;
