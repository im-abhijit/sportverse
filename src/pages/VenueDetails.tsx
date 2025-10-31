import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Car, Zap, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
import { createOrder, verifySignature } from "@/services/paymentsApi";

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
                  {isCreatingOrder ? "Creating Order..." : "Proceed to Payment"}
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
    </div>
  );
};

export default VenueDetails;
