import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Car, Zap, Users, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
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
  const [slots, setSlots] = useState<{ id: string; time: string; available: boolean; price: number }[]>(() => {
    const s = (passedVenue?.prefetchedSlots as any[]) || [];
    return s.map((slot) => ({
      id: slot.slotId || slot.id || `${slot.startTime}-${slot.endTime}`,
      time: `${slot.startTime} - ${slot.endTime}`,
      available: !(slot.isBooked ?? slot.booked),
      price: slot.price,
    }));
  });
  const [hasFetchedSlots, setHasFetchedSlots] = useState(() => {
    return Array.isArray(passedVenue?.prefetchedSlots) && passedVenue.prefetchedSlots.length > 0;
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // UPI ID - you can replace this with actual UPI ID
  const UPI_ID = "sportverse@paytm"; // Replace with actual UPI ID
  
  // Generate QR code URL based on amount
  const getQRCodeURL = (amount: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=Sportverse&am=${amount}&cu=INR`)}`;
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
        { icon: Zap, label: "Floodlights" },
        { icon: Car, label: "Parking" },
        { icon: Wifi, label: "WiFi" },
        { icon: Users, label: "Changing Rooms" },
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
      const mapped = s.map((slot: any) => ({
        id: slot.slotId || slot.id || `${slot.startTime}-${slot.endTime}`,
        time: `${slot.startTime} - ${slot.endTime}`,
        available: !(slot.isBooked ?? slot.booked),
        price: slot.price,
      }));
      setSlots(mapped);
      setSelectedSlots([]);
    } catch (e) {
      setSlots([]);
      setSelectedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Do not auto-fetch; fetch on the first Book Now click

  const handleBooking = async () => {
    // First click: fetch slots for the current date
    if (!hasFetchedSlots && slots.length === 0) {
      console.log("Fetching slots for first time...");
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
          // Debug: ensure handler is invoked and payload present
          console.log("Razorpay success response", paymentResponse);
          try {
            const verifyResp = await verifySignature(
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_order_id,
              paymentResponse.razorpay_signature
            );
            console.log("Verify signature response", verifyResp);
            if (verifyResp.success) {
              toast.success("Payment verified successfully");
              navigate("/dashboard");
            } else {
              toast.error(verifyResp.message || "Payment verification failed");
            }
          } catch (err: any) {
            console.error("Verify signature error", err);
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
      console.error("Create order error", e);
      toast.error(e?.message || "Could not create order");
    } finally {
      setIsCreatingOrder(false);
    }
    */
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Please verify my booking");
    const whatsappUrl = `https://wa.me/919876543210?text=${message}`; // Replace with actual WhatsApp number
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Image Gallery */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[400px]">
          <div className="md:col-span-2 rounded-2xl overflow-hidden">
            <img
              src={venue.images[0]}
              alt={venue.name}
              className="block w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            {venue.images.slice(1, 3).map((image, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden">
                <img
                  src={image}
                  alt={`${venue.name} ${idx + 2}`}
                  className="block w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Title/Address/Description directly under images (desktop and mobile) */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{venue.name}</h1>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {venue.location}
          </div>
          {venue.description && (
            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* Left Column - Venue Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* You can add rating/reviews here below the description if needed */}

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
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
                    <p className="text-sm text-muted-foreground">Loading slots...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {slots.map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={
                            selectedSlots.includes(slot.id) ? "default" : "outline"
                          }
                          disabled={!slot.available}
                          onClick={() =>
                            setSelectedSlots((prev) =>
                              prev.includes(slot.id)
                                ? prev.filter((t) => t !== slot.id)
                                : [...prev, slot.id]
                            )
                          }
                          className={`h-auto py-3 ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={slot.available ? `₹${slot.price}` : "Booked"}
                        >
                          {slot.time} (₹{slot.price})
                        </Button>
                      ))}
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
                  className="w-full"
                  onClick={handleBooking}
                  disabled={isCreatingOrder}
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
            <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-primary">
              <img 
                src={getQRCodeURL(totalAmount)} 
                alt="QR Code" 
                className="w-36 h-36 sm:w-44 sm:h-44 mx-auto"
              />
            </div>
            <div className="text-center space-y-2 w-full">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Scan QR Code</p>
              <p className="text-base sm:text-lg font-bold text-foreground">OR</p>
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Pay via UPI ID</p>
              <div className="bg-muted px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border">
                <p className="text-base sm:text-xl font-bold text-primary font-mono break-all">{UPI_ID}</p>
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
            <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
              📸 Make payment and send screenshot to verify your booking
            </p>
          </div>

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-14 text-sm sm:text-base"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Send Screenshot on WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default VenueDetails;
