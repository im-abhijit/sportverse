import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ArrowLeft, Clock, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";

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
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [slotPrices, setSlotPrices] = useState<Map<string, number>>(new Map());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate all slots from 4 AM to 12 AM (midnight) - 40 slots of 30 minutes each
  const allSlots = useMemo(() => {
    const slots: { startTime: string; endTime: string; key: string }[] = [];
    for (let hour = 4; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = String(hour).padStart(2, "0");
        const startMin = String(minute).padStart(2, "0");
        const startTime = `${startHour}:${startMin}`;
        
        let endHour = hour;
        let endMin = minute + 30;
        if (endMin >= 60) {
          endHour++;
          endMin = 0;
        }
        // Handle midnight (24:00 becomes 00:00)
        if (endHour >= 24) {
          endHour = 0;
        }
        const endHourStr = String(endHour).padStart(2, "0");
        const endMinStr = String(endMin).padStart(2, "0");
        const endTime = `${endHourStr}:${endMinStr}`;
        
        slots.push({
          startTime,
          endTime,
          key: `${startTime}-${endTime}`,
        });
      }
    }
    return slots;
  }, []);

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
        
        // Pre-select slots that are already open (not booked) and initialize prices
        const openSlots = new Set<string>();
        const pricesMap = new Map<string, number>();
        slots.forEach((slot: Slot) => {
          const key = `${slot.startTime}-${slot.endTime}`;
          if (slot.price !== undefined) {
            pricesMap.set(key, slot.price);
          }
          if (!slot.booked) {
            openSlots.add(key);
          }
        });
        setSelectedSlots(openSlots);
        setSlotPrices(pricesMap);
      } else {
        setExistingSlots([]);
        setSelectedSlots(new Set());
        setSlotPrices(new Map());
      }
    } catch (error) {
      setExistingSlots([]);
      setSelectedSlots(new Set());
      setSlotPrices(new Map());
    } finally {
      setLoadingSlots(false);
    }
  };

  const isSlotBooked = (slotKey: string): boolean => {
    const slot = existingSlots.find(
      (s) => `${s.startTime}-${s.endTime}` === slotKey
    );
    return !!(slot?.booked || slot?.isBooked);
  };

  const handleSlotToggle = (slotKey: string) => {
    // Don't allow toggling booked slots
    if (isSlotBooked(slotKey)) {
      return;
    }

    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotKey)) {
        newSet.delete(slotKey);
      } else {
        newSet.add(slotKey);
        // Price will be set by user via the input field
      }
      return newSet;
    });
  };

  const handlePriceChange = (slotKey: string, value: string) => {
    // Allow empty string to clear the input
    if (value === "" || value === undefined) {
      setSlotPrices((prev) => {
        const newPrices = new Map(prev);
        newPrices.delete(slotKey);
        return newPrices;
      });
      return;
    }
    
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setSlotPrices((prev) => {
        const newPrices = new Map(prev);
        newPrices.set(slotKey, price);
        return newPrices;
      });
    }
  };

  const getSlotPrice = (slotKey: string): number | string => {
    const price = slotPrices.get(slotKey);
    return price !== undefined ? price : "";
  };

  const handleSaveSlots = async () => {
    if (!selectedDate || !venueId) {
      toast.error("Please select a date");
      return;
    }

    if (selectedSlots.size === 0) {
      toast.error("Please select at least one slot to open");
      return;
    }

    // Validate that all selected slots have valid prices
    const slotsWithoutPrice = Array.from(selectedSlots).filter(
      (slotKey) => {
        const price = slotPrices.get(slotKey);
        return price === undefined || price === null || price <= 0 || isNaN(price);
      }
    );
    if (slotsWithoutPrice.length > 0) {
      toast.error("Please set a valid price (greater than 0) for all selected slots");
      return;
    }

    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      // TODO: Replace with actual API endpoint when provided
      // For now, using a dummy API call
      const slotsToSave = Array.from(selectedSlots).map((slotKey) => {
        const [startTime, endTime] = slotKey.split("-");
        return {
          venueId,
          date: dateStr,
          startTime,
          endTime,
          price: slotPrices.get(slotKey)!,
        };
      });

      // TODO: Replace with actual bulk save API endpoint when provided
      // For now, we'll call the existing createSlot API for each slot
      // This is temporary until the bulk save API is provided
      
      // Get existing slot keys to avoid creating duplicates
      const existingSlotKeys = new Set(
        existingSlots.map((s) => `${s.startTime}-${s.endTime}`)
      );
      
      // Filter out slots that already exist
      const newSlotsToSave = slotsToSave.filter(
        (slot) => !existingSlotKeys.has(`${slot.startTime}-${slot.endTime}`)
      );

      if (newSlotsToSave.length === 0) {
        toast.info("All selected slots already exist");
        setSaving(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const slot of newSlotsToSave) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/slots`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(slot),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully saved ${successCount} slot(s)`);
        fetchExistingSlots(); // Refresh the list
      }
      if (errorCount > 0) {
        toast.error(`Failed to save ${errorCount} slot(s)`);
      }
    } catch (error) {
      toast.error("Failed to save slots. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatTimeSlot = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
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
                Select and manage time slots for your venue. Each slot is 30 minutes long.
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

              {/* Slots Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Time Slots for {format(selectedDate, "PPP")}
                  </h3>
                  {loadingSlots && (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading slots...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allSlots.map((slot) => {
                        const slotKey = slot.key;
                        const isBooked = isSlotBooked(slotKey);
                        const isSelected = selectedSlots.has(slotKey);
                        const isDisabled = isBooked;
                        const price = getSlotPrice(slotKey);

                        return (
                          <div
                            key={slotKey}
                            className={cn(
                              "relative p-4 rounded-lg border-2 transition-all",
                              isBooked
                                ? "bg-muted/50 border-muted-foreground/50 opacity-60 grayscale cursor-not-allowed"
                                : isSelected
                                ? "bg-primary/10 border-primary cursor-pointer"
                                : "bg-background border-border cursor-pointer hover:border-primary"
                            )}
                          >
                            <div className="space-y-3">
                              {/* Checkbox and Time */}
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onCheckedChange={() => !isDisabled && handleSlotToggle(slotKey)}
                                  className={cn(
                                    isBooked && "opacity-50",
                                    "mt-0.5"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className={cn(
                                    "text-sm font-medium",
                                    isBooked && "text-muted-foreground line-through"
                                  )}>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </div>
                                  {isBooked && (
                                    <div className="text-xs text-destructive mt-1 font-medium">
                                      Booked
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Price Input */}
                              {isSelected && !isDisabled && (
                                <div className="space-y-1">
                                  <Label htmlFor={`price-${slotKey}`} className="text-xs">
                                    Price (₹)
                                  </Label>
                                  <Input
                                    id={`price-${slotKey}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price === "" ? "" : price}
                                    onChange={(e) => handlePriceChange(slotKey, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                    className="h-8 text-sm"
                                    placeholder="Enter price"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected slots count and save button */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {selectedSlots.size} slot(s) selected
                      </p>
                      <Button
                        onClick={handleSaveSlots}
                        disabled={saving || selectedSlots.size === 0}
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
                  </>
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
