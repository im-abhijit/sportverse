import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Car, Zap, Users, MessageCircle, Upload, X, CheckCircle2, Copy } from "lucide-react";
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
import { uploadImageToImageKit } from "@/utils/imageKitUpload";
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
  const [fullVenueData, setFullVenueData] = useState<any>(passedVenue);
  const [loadingVenue, setLoadingVenue] = useState(false);
  
  // Payment screenshot upload states
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  // Fetch full venue details with all photos when page loads
  useEffect(() => {
    const fetchFullVenueDetails = async () => {
      const venueId = passedVenue?.venueId || passedVenue?.id || (id as string);
      if (!venueId) return;

      // Always fetch to ensure we have all photos loaded
      setLoadingVenue(true);
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
            setFullVenueData(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch venue details:", error);
        // Keep using passedVenue as fallback
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchFullVenueDetails();
  }, [id, passedVenue?.venueId, passedVenue?.id]);

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

  // Helper function to get icon for amenity
  const getAmenityIcon = (amenityName: string) => {
    const lowerName = amenityName.toLowerCase();
    if (lowerName.includes("light") || lowerName.includes("flood")) {
      return Zap;
    }
    if (lowerName.includes("parking") || lowerName.includes("car")) {
      return Car;
    }
    if (lowerName.includes("wifi") || lowerName.includes("wi-fi")) {
      return Wifi;
    }
    if (lowerName.includes("user") || lowerName.includes("people") || lowerName.includes("capacity")) {
      return Users;
    }
    // Default icon if no match
    return Zap;
  };

  const venue = useMemo(() => {
    // Use fullVenueData if available (has all photos), otherwise fallback to passedVenue
    const venueData = fullVenueData || passedVenue;
    const name = venueData?.name || "Venue";
    const locationText = venueData?.city || venueData?.address || venueData?.addtress || "";
    const rating = venueData?.rating || 4.5;
    const price = venueData?.price || 0;
    const photos: string[] = Array.isArray(venueData?.photos) ? venueData.photos : [];
    const images = (photos.length ? photos : [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    ]).map((p: string) => {
      if (!p) return p;
      // Return URL as-is (no base64 conversion - backend now sends URLs)
      return p;
    });
    const description = passedVenue?.description || "";
    
    // Use amenities from API, map to icon/label structure
    const apiAmenities: string[] = Array.isArray(venueData?.amenities) ? venueData.amenities : [];
    const amenities = apiAmenities.map((amenity) => ({
      icon: getAmenityIcon(amenity),
      label: amenity,
    }));
    
    return {
      name,
      location: locationText,
      price,
      rating,
      reviews: venueData?.reviews || 0,
      images,
      description,
      amenities,
    };
  }, [fullVenueData, passedVenue]);

  const fetchSlots = async (d: Date | undefined) => {
    const venueId = fullVenueData?.id || passedVenue?.venueId || passedVenue?.id || (id as string);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setPaymentScreenshotFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!paymentScreenshotFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploadingScreenshot(true);
    setUploadProgress(0);
    try {
      const uploadedUrl = await uploadImageToImageKit(paymentScreenshotFile, (progress) => {
        setUploadProgress(progress);
      });
      setPaymentScreenshotUrl(uploadedUrl);
      setUploadProgress(100);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleRemoveImage = () => {
    setPaymentScreenshotFile(null);
    setPaymentScreenshotUrl(null);
    setUploadPreview(null);
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.getElementById("payment-screenshot-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(venueUpiId);
      toast.success("UPI ID copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = venueUpiId;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("UPI ID copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy UPI ID");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleConfirmBooking = async () => {
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

    // Validate payment screenshot is uploaded
    if (!paymentScreenshotUrl) {
      toast.error("Please upload payment screenshot before confirming booking");
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
        paymentScreenshotUrl: paymentScreenshotUrl,
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

      toast.success("Booking created successfully!");
      
      // Close payment modal and reset states
      setIsPaymentModalOpen(false);
      setPaymentScreenshotUrl(null);
      setPaymentScreenshotFile(null);
      setUploadPreview(null);
      setSelectedSlots([]);
      
      // Navigate to dashboard or show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
      return;
    } finally {
      setIsCreatingOrder(false);
    }
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
                {venue.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {venue.amenities.map((amenity, idx) => {
                      const IconComponent = amenity.icon;
                      return (
                    <div key={idx} className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                      <span>{amenity.label}</span>
                    </div>
                      );
                    })}
                </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 md:top-24">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                {venue.price > 0 && (
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    ₹{venue.price}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
                )}

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
      <DialogContent className="w-[95vw] max-w-sm mx-4 p-3 sm:p-4 md:p-6 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-1 sm:pb-2">
          <DialogTitle className="text-base sm:text-lg md:text-xl">Make Payment</DialogTitle>
          <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
            Complete your booking by making the payment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5 sm:space-y-3 md:space-y-4 py-1">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-2 sm:space-y-2.5">
            {venueQrCodeImage ? (
              <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed border-primary">
                <img 
                  src={venueQrCodeImage} 
                  alt="QR Code for payment" 
                  className="w-28 h-28 sm:w-36 md:w-44 sm:h-36 md:h-44 mx-auto object-contain"
                />
              </div>
            ) : (
            <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed border-primary">
              <img 
                src={getQRCodeURL(totalAmount)} 
                  alt="QR Code for payment" 
                className="w-28 h-28 sm:w-36 md:w-44 sm:h-36 md:h-44 mx-auto"
              />
            </div>
            )}
            <div className="text-center space-y-1 sm:space-y-1.5 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Scan QR Code</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">OR</p>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Pay via UPI ID</p>
              <div className="bg-muted px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm md:text-base font-bold text-primary font-mono break-all flex-1">{venueUpiId}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUpiId}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                  aria-label="Copy UPI ID"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-primary/10 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Amount to Pay</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">₹{totalAmount}</p>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-2.5 md:p-3">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground leading-relaxed text-center">
              Make the payment of ₹{totalAmount} and upload the payment screenshot
            </p>
          </div>

          {/* Payment Screenshot Upload */}
          <div className="space-y-2 sm:space-y-2.5">
            <label className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">
              Upload Payment Screenshot *
            </label>
            
            {!uploadPreview && !paymentScreenshotUrl ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-2.5">
                  <Upload className="h-6 w-6 sm:h-8 md:h-10 sm:w-8 md:w-10 text-muted-foreground" />
                  <div className="text-center space-y-0.5 sm:space-y-1">
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">
                      Click to select image
                    </p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input
                    id="payment-screenshot-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[10px] sm:text-xs h-7 sm:h-8"
                    onClick={() => {
                      document.getElementById("payment-screenshot-input")?.click();
                    }}
                  >
                    Select Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-primary/50 rounded-lg p-2 sm:p-2.5 md:p-3 bg-muted/50">
                {uploadPreview && (
                  <div className="relative">
                    <img
                      src={uploadPreview}
                      alt="Payment screenshot preview"
                      className="w-full h-auto max-h-32 sm:max-h-40 md:max-h-48 object-contain rounded"
                    />
                    {!paymentScreenshotUrl && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <div className="text-center space-y-1 sm:space-y-1.5">
                          <p className="text-white text-[10px] sm:text-xs md:text-sm font-medium">
                            Preview - Click Upload to continue
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {isUploadingScreenshot && (
                  <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {paymentScreenshotUrl && !isUploadingScreenshot && (
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    <p className="text-[10px] sm:text-xs md:text-sm text-green-700 dark:text-green-300 font-medium">
                      Screenshot uploaded successfully
                    </p>
                  </div>
                )}
                <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 md:mt-3">
                  {!paymentScreenshotUrl && paymentScreenshotFile && (
                    <Button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploadingScreenshot}
                      className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8"
                      size="sm"
                    >
                      {isUploadingScreenshot ? (
                        <>
                          <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8"
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Booking Button */}
          <Button
            onClick={handleConfirmBooking}
            disabled={isCreatingOrder || !paymentScreenshotUrl}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Confirm booking"
          >
            {isCreatingOrder ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent mr-1.5 sm:mr-2"></div>
                Creating Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2" />
                Confirm Booking
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
