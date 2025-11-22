import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Car, Zap, Users, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import qrCodeImage from "@/assets/qrcode.jpeg";
import { API_BASE_URL } from "@/config/api";
// import { createOrder, verifySignature } from "@/services/paymentsApi"; // Commented out for manual payment

const VenueDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const passedVenue = (location.state as any) || {};
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [date, setDate] = useState<Date | undefined>(todayLocal);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // stores slotIds
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Helper function to format time with AM/PM if available
  const formatSlotTime = (slot: any): string => {
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

  const [slots, setSlots] = useState<{ id: string; time: string; available: boolean; price: number }[]>(() => {
    const s = (passedVenue?.prefetchedSlots as any[]) || [];
    return s.map((slot) => ({
      id: slot.slotId || slot.id || `${slot.startTime}-${slot.endTime}`,
      time: formatSlotTime(slot),
      available: !(slot.isBooked ?? slot.booked),
      price: slot.price,
    }));
  });
  // Store full slot data for API calls
  const [fullSlotsData, setFullSlotsData] = useState<any[]>(() => {
    return (passedVenue?.prefetchedSlots as any[]) || [];
  });
  const [hasFetchedSlots, setHasFetchedSlots] = useState(() => {
    return Array.isArray(passedVenue?.prefetchedSlots) && passedVenue.prefetchedSlots.length > 0;
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  // Hardcoded QR code image and UPI ID
  const venueQrCodeImage = qrCodeImage;
  const venueUpiId = "theskuarearena@okaxis";
  
  // Generate QR code URL based on amount (fallback if venue QR code not available)
  const getQRCodeURL = (amount: number) => {
    if (venueQrCodeImage) {
      return venueQrCodeImage;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${venueUpiId}&pn=Sportverse&am=${amount}&cu=INR`)}`;
  };

  // Always refresh slots on mount with today's local date to avoid stale data
  useEffect(() => {
    const refreshToday = async () => {
      setDate(todayLocal);
      await fetchSlots(todayLocal);
      setHasFetchedSlots(true);
      setSelectedSlots([]);
    };
    refreshToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track carousel slide changes
  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrentImageIndex(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // COMMENTED OUT: Razorpay SDK loader
  /*
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const existing = document.getElementById("razorpay-sdk");
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  */

  const venue = useMemo(() => {
    const name = passedVenue?.name || "Venue";
    const locationText = passedVenue?.city || passedVenue?.address || passedVenue?.addtress || "";
    const rating = passedVenue?.rating || 4.5;
    const price = passedVenue?.price || 0;
    const photos: string[] = Array.isArray(passedVenue?.photos) ? passedVenue.photos : [];
    const images = (photos.length ? photos : [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    ]).map((p: string) => {
      if (!p) return p;
      if (p.startsWith("http") || p.startsWith("data:")) return p;
      return `data:image/jpeg;base64,${p}`;
    });
    const description = passedVenue?.description || "";
    return {
      name,
      location: locationText,
      price,
      rating,
      reviews: passedVenue?.reviews || 0,
      images,
      description,
      amenities: [
        { icon: Zap, label: "Flood Lights" },
        { icon: Car, label: "Parking" },
      ],
    };
  }, [passedVenue]);

  const fetchSlots = async (d: Date | undefined) => {
    const venueId = passedVenue?.venueId || passedVenue?.id || (id as string);
    if (!venueId) return;
    const base = d || todayLocal;
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    const iso = `${yyyy}-${mm}-${dd}`; // local date, not UTC
    setLoadingSlots(true);
    try {
      const res = await getSlotsByVenueAndDate(venueId, iso);
      const s = res.data?.slots || [];
      // Store full slot data for API calls
      setFullSlotsData(s);
      const mapped = s.map((slot: any) => ({
        id: slot.slotId || slot.id || `${slot.startTime}-${slot.endTime}`,
        time: formatSlotTime(slot),
        available: !(slot.isBooked ?? slot.booked),
        price: slot.price,
      }));
      setSlots(mapped);
      setSelectedSlots([]);
    } catch (e) {
      setSlots([]);
      setFullSlotsData([]);
      setSelectedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Do not auto-fetch; fetch on the first Book Now click

  const handleBooking = async () => {
    // First click: fetch slots for the current date
    if (!hasFetchedSlots && slots.length === 0) {
      await fetchSlots(date);
      setHasFetchedSlots(true);
      return;
    }
    // Subsequent: proceed only if at least one slot is selected
    if (selectedSlots.length === 0) {
      toast.error("Please select a time slot");
      return;
    }
    // Ensure user is logged in before proceeding to payment
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Calculate total amount
    const amount = selectedSlots.reduce((sum, slotId) => {
      const s = slots.find((sl) => sl.id === slotId);
      return sum + (s?.price ?? 0);
    }, 0);
    setTotalAmount(amount);
    
    // Open payment modal instead of Razorpay
    setIsPaymentModalOpen(true);

    // COMMENTED OUT: Razorpay integration
    /*
    try {
      setIsCreatingOrder(true);
      const totalAmount = selectedSlots.reduce((sum, slotId) => {
        const s = slots.find((sl) => sl.id === slotId);
        return sum + (s?.price ?? 0);
      }, 0);

      const d = date || todayLocal;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const selectedDate = `${yyyy}-${mm}-${dd}`;

      const venueId = passedVenue?.venueId || passedVenue?.id || (id as string);
      const userId = localStorage.getItem("userId") || "";

      const resp = await createOrder(totalAmount, userId, venueId, selectedSlots, selectedDate);
      if (!resp.success || !resp.data) {
        toast.error(resp.message || "Failed to create order");
        return;
      }

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load. Please try again.");
        return;
      }

      const options = {
        key: resp.data.key,
        amount: resp.data.amount, // in paise from backend
        currency: resp.data.currency,
        name: "Sportverse",
        description: `${venue.name} • ${selectedDate} • ${selectedSlots
          .map((sid) => slots.find((s) => s.id === sid)?.time || sid)
          .join(", ")}`,
        order_id: resp.data.orderId,
        handler: async function (paymentResponse: any) {
          try {
            const verifyResp = await verifySignature(
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_order_id,
              paymentResponse.razorpay_signature
            );
            if (verifyResp.success) {
              toast.success("Payment verified successfully");
              navigate("/dashboard");
            } else {
              toast.error(verifyResp.message || "Payment verification failed");
            }
          } catch (err: any) {
            toast.error(err?.message || "Could not verify payment");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: "",
          contact: "",
        },
        notes: {
          address: "Sportverse",
        },
        theme: {
          color: "#2563eb",
        },
      } as any;

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (r: any) {
        const msg = r?.error?.description || "Payment failed";
        toast.error(msg);
      });
      razorpay.open();
    } catch (e: any) {
      toast.error(e?.message || "Could not create order");
    } finally {
      setIsCreatingOrder(false);
    }
    */
  };

  const handleWhatsAppClick = async () => {
    // Get partner mobile number from venue data
    const partnerMobileNo = passedVenue?.partnerMobileNo;
    if (!partnerMobileNo) {
      toast.error("Venue WhatsApp number not found. Please contact support.");
      return;
    }

    // Ensure user is logged in
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please login to continue");
      setIsAuthModalOpen(true);
      return;
    }

    // Format date
    const selectedDate = date || todayLocal;
    const formattedDate = format(selectedDate, "dd MMM yyyy");
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    // Get venue ID
    const venueId = passedVenue?.venueId || passedVenue?.id || (id as string);
    if (!venueId) {
      toast.error("Venue ID not found");
      return;
    }

    // Get partner ID from venue data (if available)
    const partnerId = passedVenue?.partnerId;

    // Build slots array from selected slots
    const slotsArray = selectedSlots.map((slotId) => {
      // Find the full slot data
      const fullSlot = fullSlotsData.find((s: any) => {
        const sId = s.slotId || s.id || `${s.startTime}-${s.endTime}`;
        return sId === slotId;
      });

      if (!fullSlot) {
        // Fallback: try to find from slots array
        const slot = slots.find((sl) => sl.id === slotId);
        if (!slot) return null;
        
        // Try to reconstruct from slot ID format
        const parts = slotId.split("-");
        return {
          slotId: slotId,
          startTime: parts[0] || "",
          endTime: parts[1] || "",
          price: slot.price,
          isBooked: true,
        };
      }

      return {
        slotId: fullSlot.slotId || slotId,
        startTime: fullSlot.startTime,
        endTime: fullSlot.endTime,
        price: fullSlot.price,
        isBooked: true,
      };
    }).filter((slot) => slot !== null);

    if (slotsArray.length === 0) {
      toast.error("No valid slots found");
      return;
    }

    // Create booking with PENDING status
    try {
      setIsCreatingOrder(true);
      const body = {
        ...(partnerId ? { partnerId } : {}),
        venueId,
        userId,
        date: dateStr,
        status: "PENDING",
        paymentStatus: "PENDING",
        slots: slotsArray,
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to create booking");
        return;
      }

      toast.success("Booking created successfully! Opening WhatsApp...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
      return;
    } finally {
      setIsCreatingOrder(false);
    }
    
    // Get selected slot details for WhatsApp message
    const selectedSlotDetails = selectedSlots
      .map((slotId) => {
        const s = slots.find((sl) => sl.id === slotId);
        return s ? `${s.time} (₹${s.price})` : null;
      })
      .filter((s) => s !== null)
      .join(", ");
    
    // Calculate total amount
    const totalAmount = selectedSlots.reduce((sum, slotId) => {
      const s = slots.find((sl) => sl.id === slotId);
      return sum + (s?.price ?? 0);
    }, 0);
    
    // Build message
    const message = `Please verify my booking:

Venue: ${venue.name}
Location: ${venue.location}
Date: ${formattedDate}
Slots: ${selectedSlotDetails}
Total Amount: ₹${totalAmount}

I am sending you the screenshot of the payment.

Please confirm this booking.`;
    
    // Clean mobile number for WhatsApp URL and ensure country code is present
    let cleanMobile = partnerMobileNo.replace(/\s+/g, ""); // Remove spaces first
    
    // Remove + if present
    if (cleanMobile.startsWith("+")) {
      cleanMobile = cleanMobile.substring(1);
    }
    
    // If number doesn't start with 91 (India country code), add it
    if (!cleanMobile.startsWith("91")) {
      // Remove leading 0 if present (some numbers might have 0 before the actual number)
      if (cleanMobile.startsWith("0")) {
        cleanMobile = cleanMobile.substring(1);
      }
      cleanMobile = "91" + cleanMobile;
    }
    
    // Remove any remaining non-digit characters (just in case)
    cleanMobile = cleanMobile.replace(/\D/g, "");
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 transition-all duration-200 hover:scale-105"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Image Gallery - Carousel */}
        {venue.images.length > 0 ? (
          <div className="relative mb-8 md:mb-12">
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setCarouselApi}
            >
              <CarouselContent>
                  {venue.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden">
                      <img
                        src={image}
                        alt={`${venue.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {venue.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 shadow-lg" />
                  <CarouselNext className="right-4 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 shadow-lg" />
                </>
              )}
            </Carousel>
            {venue.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {venue.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      carouselApi?.scrollTo(index);
                    }}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === currentImageIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative mb-12 h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No images available</p>
          </div>
        )}

        {/* Title/Address/Description directly under images (desktop and mobile) */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">{venue.name}</h1>
          <div className="flex items-center text-muted-foreground mb-3 md:mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {venue.location}
          </div>
          {venue.description && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{venue.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-4">
          {/* Left Column - Venue Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* You can add rating/reviews here below the description if needed */}

            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {venue.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <amenity.icon className="h-5 w-5 text-primary" />
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 md:top-24">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    ₹{venue.price}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      fetchSlots(d);
                    }}
                    disabled={(d) => {
                      if (!d) return false;
                      const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                      return startOfD < todayLocal;
                    }}
                    className="rounded-2xl border pointer-events-auto"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Available Slots</h3>
                  {!hasFetchedSlots && slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Click "Book Now" to load slots for today.</p>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[70px] w-full" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                      {slots.map((slot, idx) => {
                        const isSelected = selectedSlots.includes(slot.id);
                        return (
                          <Button
                            key={idx}
                            variant="outline"
                            disabled={!slot.available}
                            onClick={() => {
                              if (slot.available) {
                                setSelectedSlots((prev) =>
                                  prev.includes(slot.id)
                                    ? prev.filter((t) => t !== slot.id)
                                    : [...prev, slot.id]
                                );
                              }
                            }}
                            className={cn(
                              "h-auto py-4 px-4 transition-all duration-200 flex flex-col items-center justify-center gap-1 min-h-[70px] hover:scale-105",
                              slot.available
                                ? isSelected
                                  ? "bg-green-200 dark:bg-green-900/50 border-green-500 dark:border-green-600 hover:bg-green-300 dark:hover:bg-green-900/70 text-green-950 dark:text-green-50 ring-2 ring-green-400 dark:ring-green-600"
                                  : "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-950/50 text-green-900 dark:text-green-100"
                                : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 opacity-80 cursor-not-allowed text-red-900 dark:text-red-100"
                            )}
                            title={slot.available ? `₹${slot.price}` : "Booked - Not Available"}
                            aria-label={slot.available ? `Select slot ${slot.time} for ₹${slot.price}` : `Slot ${slot.time} is booked and not available`}
                            aria-pressed={isSelected}
                          >
                            <span className={cn(
                              "text-sm font-medium leading-tight",
                              !slot.available && "line-through"
                            )}>
                              {slot.time}
                            </span>
                            <span className={cn(
                              "text-xs font-semibold",
                              !slot.available && "line-through"
                            )}>
                              ₹{slot.price}
                            </span>
                            {!slot.available && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">Booked</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                  {selectedSlots.length > 0 && (
                  <div className="p-4 rounded-xl bg-muted space-y-3">
                    <div className="font-semibold">Selected Slots</div>
                    <div className="space-y-1">
                      {selectedSlots.map((slotId) => {
                        const s = slots.find((sl) => sl.id === slotId);
                        return (
                          <div key={slotId} className="flex justify-between text-sm">
                            <span>{s?.time || slotId}</span>
                            <span className="font-medium">₹{s?.price ?? 0}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">₹{
                        selectedSlots.reduce((sum, slotId) => {
                          const s = slots.find((sl) => sl.id === slotId);
                          return sum + (s?.price ?? 0);
                        }, 0)
                      }</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full transition-all duration-200 hover:scale-105"
                  onClick={handleBooking}
                  disabled={isCreatingOrder}
                  aria-label="Proceed to booking"
                >
                  {isCreatingOrder ? "Creating Order..." : "Proceed for Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      initialMode="login"
      redirectOnSuccessTo={null}
      onLoginSuccess={() => {
        // Close modal and remain on booking page; user can click Proceed again
        setIsAuthModalOpen(false);
      }}
    />
    
    {/* Manual Payment Modal */}
    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
      <DialogContent className="w-[95vw] max-w-sm mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl">Make Payment</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete your booking by making the payment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-5 py-2">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            {venueQrCodeImage ? (
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-primary">
                <img 
                  src={venueQrCodeImage} 
                  alt="QR Code for payment" 
                  className="w-36 h-36 sm:w-44 sm:h-44 mx-auto object-contain"
                />
              </div>
            ) : (
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-primary">
                <img 
                  src={getQRCodeURL(totalAmount)} 
                  alt="QR Code for payment" 
                  className="w-36 h-36 sm:w-44 sm:h-44 mx-auto"
                />
              </div>
            )}
            <div className="text-center space-y-2 w-full">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Scan QR Code</p>
              <p className="text-base sm:text-lg font-bold text-foreground">OR</p>
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Pay via UPI ID</p>
              <div className="bg-muted px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border">
                <p className="text-base sm:text-xl font-bold text-primary font-mono break-all">{venueUpiId}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-primary/10 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">₹{totalAmount}</p>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed text-center">
              Make the payment of ₹{totalAmount} and send screenshot to the owner
            </p>
          </div>

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsAppClick}
            disabled={isCreatingOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-14 text-sm sm:text-base transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send payment screenshot on WhatsApp"
          >
            {isCreatingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating Booking...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Send Screenshot on WhatsApp
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default VenueDetails;
