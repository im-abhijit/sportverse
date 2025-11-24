import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ArrowLeft, Clock, Save, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  startTimeAmPm?: string;
  endTimeAmPm?: string;
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Selected slots with prices (key: time slot like "6 AM", value: price and selection state)
  const [selectedSlots, setSelectedSlots] = useState<Record<string, { price: number; selected: boolean; hour24: number; amPm: "AM" | "PM" }>>({});

  // Generate all time slots from 6 AM to 12 AM (midnight) in 1-hour increments
  const allTimeSlots = useMemo(() => {
    const slots: Array<{ label: string; hour24: number; amPm: "AM" | "PM" }> = [];
    
    // 6 AM to 11 AM
    for (let hour = 6; hour < 12; hour++) {
      slots.push({
        label: `${hour} AM`,
        hour24: hour,
        amPm: "AM",
      });
    }
    
    // 12 PM (noon)
    slots.push({
      label: "12 PM",
      hour24: 12,
      amPm: "PM",
    });
    
    // 1 PM to 11 PM
    for (let hour = 1; hour < 12; hour++) {
      slots.push({
        label: `${hour} PM`,
        hour24: hour + 12,
        amPm: "PM",
      });
    }
    
    // 12 AM (midnight)
    slots.push({
      label: "12 AM",
      hour24: 0,
      amPm: "AM",
    });
    
    return slots;
  }, []);

  // Helper function to convert hour and AM/PM to 12-hour format time string
  const getTimeString = (hour24: number, amPm: "AM" | "PM"): string => {
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:00`;
  };

  // Helper function to get end time (1 hour later)
  const getEndTime = (hour24: number): { hour24: number; amPm: "AM" | "PM"; label: string } => {
    const nextHour24 = (hour24 + 1) % 24;
    let hour12 = nextHour24 % 12;
    if (hour12 === 0) hour12 = 12;
    // Fix AM/PM: 0-11 is AM, 12-23 is PM
    const amPm = nextHour24 >= 12 ? "PM" : "AM";
    return {
      hour24: nextHour24,
      amPm,
      label: `${hour12} ${amPm}`,
    };
  };

  // Helper function to format slot time using backend data (with AM/PM if available)
  const formatSlotTime = (slot: any): string => {
    const startTime = slot.startTime || "";
    const endTime = slot.endTime || "";
    const startAmPm = slot.startTimeAmPm || "";
    const endAmPm = slot.endTimeAmPm || "";
    
    // If AM/PM data is available from backend, use it directly
    if (startAmPm || endAmPm) {
      const startDisplay = startAmPm ? `${startTime} ${startAmPm}` : startTime;
      const endDisplay = endAmPm ? `${endTime} ${endAmPm}` : endTime;
      return `${startDisplay} - ${endDisplay}`;
    }
    
    // Fallback: convert from 24-hour format if AM/PM not available
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
    
    const startTime12 = convertTo12Hour(startTime);
    const endTime12 = convertTo12Hour(endTime);
    return `${startTime12.hour}:${startTime12.minute} ${startTime12.amPm} - ${endTime12.hour}:${endTime12.minute} ${endTime12.amPm}`;
  };

  // Helper function to convert 24-hour format to 12-hour format (for fallback)
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

  // Filter out existing slots from available slots
  const availableSlots = useMemo(() => {
    if (existingSlots.length === 0) {
      return allTimeSlots;
    }

    return allTimeSlots.filter((slot) => {
      const endTime = getEndTime(slot.hour24);
      const startTimeStr = getTimeString(slot.hour24, slot.amPm);
      const endTimeStr = getTimeString(endTime.hour24, endTime.amPm);
      
      // Check if this slot matches any existing slot
      return !existingSlots.some((existingSlot) => {
        const existingStart = existingSlot.startTime;
        const existingEnd = existingSlot.endTime;
        const existingStartAmPm = existingSlot.startTimeAmPm || "";
        const existingEndAmPm = existingSlot.endTimeAmPm || "";
        
        // Match if times and AM/PM match
        if (existingSlot.startTimeAmPm && existingSlot.endTimeAmPm) {
          return (
            existingStart === startTimeStr &&
            existingEnd === endTimeStr &&
            existingStartAmPm === slot.amPm &&
            existingEndAmPm === endTime.amPm
          );
        }
        
        // Fallback: match by time strings only
        return existingStart === startTimeStr && existingEnd === endTimeStr;
      });
    });
  }, [allTimeSlots, existingSlots]);

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
        // Use slot data directly from backend, preserving all fields including AM/PM
        const slots = response.data.slots.map((slot: any) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          startTimeAmPm: slot.startTimeAmPm,
          endTimeAmPm: slot.endTimeAmPm,
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

  // Toggle slot selection
  const handleToggleSlot = (slotLabel: string, hour24: number, amPm: "AM" | "PM") => {
    setSelectedSlots((prev) => {
      const isSelected = prev[slotLabel]?.selected || false;
      if (isSelected) {
        // Deselect slot
        const { [slotLabel]: removed, ...rest } = prev;
        return rest;
      } else {
        // Select slot with default price 0
        return {
          ...prev,
          [slotLabel]: {
            selected: true,
            price: 0,
            hour24,
            amPm,
          },
        };
      }
    });
  };

  // Update price for a selected slot
  const handlePriceChange = (slotLabel: string, price: string) => {
    const priceNum = parseFloat(price) || 0;
    setSelectedSlots((prev) => {
      if (prev[slotLabel]) {
        return {
          ...prev,
          [slotLabel]: {
            ...prev[slotLabel],
            price: priceNum,
          },
        };
      }
      return prev;
    });
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

    // Get all selected slots
    const selectedSlotsList = Object.entries(selectedSlots)
      .filter(([_, data]) => data.selected)
      .map(([label, data]) => {
        const slot = allTimeSlots.find((s) => s.label === label);
        if (!slot) return null;
        
        const endTime = getEndTime(slot.hour24);
        const startTimeStr = getTimeString(slot.hour24, slot.amPm);
        const endTimeStr = getTimeString(endTime.hour24, endTime.amPm);
        
        return {
          slotLabel: label,
          startTime: startTimeStr,
          endTime: endTimeStr,
          startTimeAmPm: slot.amPm,
          endTimeAmPm: endTime.amPm,
          price: data.price,
        };
      })
      .filter((slot) => slot !== null);

    if (selectedSlotsList.length === 0) {
      toast.error("Please select at least one slot to save");
      return;
    }

    // Validate that all selected slots have prices > 0
    const slotsWithoutPrice = selectedSlotsList.filter((slot) => !slot || slot.price <= 0);
    if (slotsWithoutPrice.length > 0) {
      toast.error("Please enter a valid price (greater than 0) for all selected slots");
      return;
    }

    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      // Build slots array for the API request
      const slotsForApi = selectedSlotsList.map((slot) => {
        if (!slot) return null;
        // Generate slotId with AM/PM data: e.g., "7:00AM-8:00AM" or "2:00PM-3:00PM"
        const slotId = `${slot.startTime}${slot.startTimeAmPm}-${slot.endTime}${slot.endTimeAmPm}`;
        return {
          slotId,
          startTime: slot.startTime, // 12-hour format (e.g., "6:00")
          endTime: slot.endTime, // 12-hour format (e.g., "7:00")
          startTimeAmPm: slot.startTimeAmPm,
          endTimeAmPm: slot.endTimeAmPm,
          price: slot.price,
          isBooked: false,
        };
      }).filter((slot) => slot !== null);

      // Call the bulk create slots API
      const response = await bulkCreateSlots({
        venueId,
        date: dateStr,
        slots: slotsForApi as any[],
      });

      if (response.success) {
        toast.success(response.message || "Slots saved successfully");
        // Clear the selected slots
        setSelectedSlots({});
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
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/partner/dashboard")}
          className="mb-4 md:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Venue: {venue?.name || "Loading..."}</CardTitle>
              <CardDescription>
                Select time slots from 6 AM to 12 AM (1 hour each) and enter the price for each selected slot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Slot Selection Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Select Time Slots for {format(selectedDate, "PPP")}
                  </h3>
                  {loadingSlots && (
                    <p className="text-sm text-muted-foreground">Loading existing slots...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Select slots from 6 AM to 12 AM (1 hour each) and enter the price for each selected slot.
                  </p>
                  
                  {/* Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlots[slot.label]?.selected || false;
                      const price = selectedSlots[slot.label]?.price || 0;
                      const endTime = getEndTime(slot.hour24);
                      
                      return (
                        <Card
                          key={slot.label}
                          className={cn(
                            "p-3 md:p-4 border-2 transition-all cursor-pointer hover:border-primary",
                            isSelected ? "border-primary bg-primary/5" : "border-muted"
                          )}
                        >
                          <div className="space-y-3">
                            {/* Checkbox and Time Label */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`slot-${slot.label}`}
                                checked={isSelected}
                                onCheckedChange={() => handleToggleSlot(slot.label, slot.hour24, slot.amPm)}
                              />
                              <Label
                                htmlFor={`slot-${slot.label}`}
                                className="text-sm md:text-base font-medium cursor-pointer flex-1"
                              >
                                {slot.label} - {endTime.label}
                              </Label>
                            </div>
                            
                            {/* Price Input (only shown when selected) */}
                            {isSelected && (
                              <div className="space-y-1">
                                <Label htmlFor={`price-${slot.label}`} className="text-xs text-muted-foreground">
                                  Price (₹)
                                </Label>
                                <Input
                                  id={`price-${slot.label}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter price"
                                  value={price > 0 ? price : ""}
                                  onChange={(e) => handlePriceChange(slot.label, e.target.value)}
                                  className="w-full text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {Object.values(selectedSlots).filter((s) => s.selected).length} slot(s) selected
                  </p>
                  <Button
                    onClick={handleSaveSlots}
                    disabled={saving || Object.values(selectedSlots).filter((s) => s.selected).length === 0}
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
              </div>

              {/* Existing Slots Display */}
              {!loadingSlots && existingSlots.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-base font-semibold">
                    Existing Slots ({existingSlots.length})
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {existingSlots.map((slot, index) => {
                      const isBooked = slot.booked || slot.isBooked;
                      const isDeleting = deletingSlotId === slot.slotId;
                      // Use backend data directly with formatSlotTime helper
                      const displayTime = formatSlotTime(slot);
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
                              {displayTime}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditVenue;
