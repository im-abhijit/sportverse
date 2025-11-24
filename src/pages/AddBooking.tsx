import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSlotsByVenueAndDate, SlotDto } from "@/services/slotsApi";
import { getVenuesByPartner, VenueDto } from "@/services/venuesApi";
import { API_BASE_URL } from "@/config/api";

const AddBooking = () => {
  const navigate = useNavigate();
  // Initialize with today's date (set to start of day)
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const [venues, setVenues] = useState<VenueDto[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(getToday());
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Helper function to format time with AM/PM if available
  const formatSlotTime = (slot: SlotDto): string => {
    const startTime = slot.startTime || "";
    const endTime = slot.endTime || "";
    const startAmPm = slot.startTimeAmPm || "";
    const endAmPm = slot.endTimeAmPm || "";
    
    // If AM/PM data is available, use it
    if (startAmPm || endAmPm) {
      const startDisplay = startAmPm ? `${startTime} ${startAmPm}` : startTime;
      const endDisplay = endAmPm ? `${endTime} ${endAmPm}` : endTime;
      return `${startDisplay} - ${endDisplay}`;
    }
    
    // Otherwise, just show the times as is
    return `${startTime} - ${endTime}`;
  };

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

  // Load partner venues from localStorage (already fetched on dashboard)
  useEffect(() => {
    const partnerId = localStorage.getItem("partnerId");
    const isPartnerLoggedIn = localStorage.getItem("isPartnerLoggedIn");
    
    // Double check authentication before fetching
    if (!partnerId || isPartnerLoggedIn !== "true") {
      return; // Will be handled by auth check above
    }

    // Try to get venues from localStorage first (cached from dashboard)
    const cachedVenues = localStorage.getItem("partnerVenues");
    if (cachedVenues) {
      try {
        const venuesList = JSON.parse(cachedVenues);
        setVenues(venuesList);
        setIsLoadingVenues(false);
        return;
      } catch (error) {
        // Fall through to fetch if parsing fails
      }
    }

    // Only fetch if not in localStorage
    setIsLoadingVenues(true);
    const fetchVenues = async () => {
      try {
        const response = await getVenuesByPartner(partnerId);
        if (response.success && response.data) {
          const venuesList = Array.isArray(response.data) ? response.data : [response.data];
          setVenues(venuesList);
          // Store for future use
          localStorage.setItem("partnerVenues", JSON.stringify(venuesList));
        } else {
          toast.error(response.message || "Failed to fetch venues");
          setVenues([]);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load venues");
        setVenues([]);
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [navigate]);

  // Fetch slots when venue and date are selected
  useEffect(() => {
    if (!selectedVenueId || !selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const response = await getSlotsByVenueAndDate(selectedVenueId, dateStr);
        
        if (response.success && response.data) {
          setSlots(response.data.slots || []);
          // Clear selected slots when fetching new slots
          setSelectedSlots(new Set());
        } else {
          toast.error(response.message || "Failed to fetch slots");
          setSlots([]);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load slots");
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedVenueId, selectedDate]);

  const handleSlotToggle = (slotId: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVenueId) {
      toast.error("Please select a venue");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (selectedSlots.size === 0) {
      toast.error("Please select at least one slot");
      return;
    }

    if (!mobileNumber || mobileNumber.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      const partnerId = localStorage.getItem("partnerId");
      if (!partnerId) {
        toast.error("Partner ID not found. Please login again.");
        navigate("/partner/login");
        return;
      }

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Build slots array from selected slots
      const slotsArray = Array.from(selectedSlots).map((slotKey) => {
        // Find the slot object from the slots array
        const slot = slots.find((s) => {
          const sKey = s.slotId || `${s.startTime}-${s.endTime}`;
          return sKey === slotKey;
        });

        if (!slot) {
          throw new Error(`Slot not found: ${slotKey}`);
        }

        return {
          slotId: slot.slotId || slotKey,
          startTime: slot.startTime,
          endTime: slot.endTime,
          startTimeAmPm: slot.startTimeAmPm,
          endTimeAmPm: slot.endTimeAmPm,
          price: slot.price,
          isBooked: true, // Always true when creating a new booking
        };
      });

      // TODO: Get userId from mobile number - you may need to add an API endpoint
      // For now, using mobile number as userId (backend may handle lookup)
      // If your backend requires actual userId, you'll need to add a lookup API
      const userId = mobileNumber.trim();

      const body = {
        partnerId,
        venueId: selectedVenueId,
        userId,
        date: dateStr,
        status: "SUCCESS",
        paymentStatus: "SUCCESS",
        slots: slotsArray.map(slot => ({
          ...slot,
          isBooked: true // Force isBooked to true
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Booking added successfully!");
        navigate("/partner/dashboard");
      } else {
        toast.error(data.message || "Failed to add booking");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Add New Booking</h1>
              <p className="text-muted-foreground">Create a booking for a user</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/partner/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Venue Selection */}
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-base font-semibold">
                  Select Venue *
                </Label>
                <Select
                  value={selectedVenueId}
                  onValueChange={setSelectedVenueId}
                  disabled={isLoadingVenues}
                >
                  <SelectTrigger id="venue" className="w-full">
                    <SelectValue placeholder={isLoadingVenues ? "Loading venues..." : "Select a venue"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingVenues ? (
                      <SelectItem value="loading" disabled>
                        Loading venues...
                      </SelectItem>
                    ) : venues.length === 0 ? (
                      <SelectItem value="no-venues" disabled>
                        No venues available
                      </SelectItem>
                    ) : (
                      venues.map((venue) => {
                        const venueId = venue.id || "";
                        if (!venueId) return null;
                        return (
                          <SelectItem key={venueId} value={venueId}>
                            {venue.name}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Select Date *</Label>
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
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(0, 0, 0, 0);
                          setSelectedDate(newDate);
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => {
                        const today = getToday();
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Slots Selection */}
              {selectedVenueId && selectedDate && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Select Slots *</Label>
                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading slots...</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <p className="text-muted-foreground">No slots available for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg max-h-96 overflow-y-auto">
                      {slots.map((slot) => {
                        const slotKey = slot.slotId || `${slot.startTime}-${slot.endTime}`;
                        const isSelected = selectedSlots.has(slotKey);
                        const isBooked = slot.booked || slot.isBooked;

                        return (
                          <label
                            key={slotKey}
                            className={cn(
                              "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                              isBooked
                                ? "bg-muted/50 border-muted-foreground/50 opacity-60 cursor-not-allowed grayscale"
                                : isSelected
                                ? "bg-primary/10 border-primary cursor-pointer"
                                : "hover:bg-muted cursor-pointer"
                            )}
                            onClick={(e) => {
                              if (isBooked) {
                                e.preventDefault();
                                return;
                              }
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isBooked}
                              onCheckedChange={() => {
                                if (!isBooked) {
                                  handleSlotToggle(slotKey);
                                }
                              }}
                            />
                            <div className="flex-1 pointer-events-none">
                              <p className={cn(
                                "text-sm font-medium",
                                isBooked && "text-muted-foreground line-through"
                              )}>
                                {formatSlotTime(slot)}
                              </p>
                              <p className={cn(
                                "text-xs",
                                isBooked ? "text-destructive font-medium" : "text-muted-foreground"
                              )}>
                                ₹{slot.price} {isBooked && "• Booked"}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {selectedSlots.size > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedSlots.size} slot{selectedSlots.size > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-base font-semibold">
                  User Mobile Number *
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/partner/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !selectedVenueId || selectedSlots.size === 0}
                >
                  {isSubmitting ? "Adding Booking..." : "Add Booking"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddBooking;

