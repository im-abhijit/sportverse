import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Car, Zap, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const VenueDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const venue = {
    name: "Elite Sports Arena",
    location: "Andheri West, Mumbai, Maharashtra",
    price: 1200,
    rating: 4.8,
    reviews: 245,
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    ],
    description:
      "Premium sports venue with state-of-the-art facilities. Perfect for cricket, football, and badminton. Our venue offers professional-grade equipment and well-maintained grounds.",
    amenities: [
      { icon: Zap, label: "Floodlights" },
      { icon: Car, label: "Parking" },
      { icon: Wifi, label: "WiFi" },
      { icon: Users, label: "Changing Rooms" },
    ],
  };

  const timeSlots = [
    { time: "06:00 - 07:00", available: true },
    { time: "07:00 - 08:00", available: true },
    { time: "08:00 - 09:00", available: false },
    { time: "09:00 - 10:00", available: true },
    { time: "10:00 - 11:00", available: true },
    { time: "17:00 - 18:00", available: true },
    { time: "18:00 - 19:00", available: false },
    { time: "19:00 - 20:00", available: true },
  ];

  const handleBooking = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    toast.success("Proceeding to payment...");
    navigate("/booking");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 h-[400px]">
          <div className="md:col-span-2 rounded-2xl overflow-hidden">
            <img
              src={venue.images[0]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            {venue.images.slice(1, 3).map((image, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden">
                <img
                  src={image}
                  alt={`${venue.name} ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Venue Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{venue.name}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {venue.location}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-accent text-accent mr-1" />
                  <span className="font-semibold">{venue.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({venue.reviews} reviews)
                </span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About This Venue</h2>
                <p className="text-muted-foreground">{venue.description}</p>
              </CardContent>
            </Card>

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
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-2xl border pointer-events-auto"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Available Slots</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map((slot, idx) => (
                      <Button
                        key={idx}
                        variant={
                          selectedSlot === slot.time ? "default" : "outline"
                        }
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className="h-auto py-3"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedSlot && (
                  <div className="p-4 rounded-xl bg-muted space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Selected Slot:</span>
                      <span className="font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span className="font-medium">₹{venue.price}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">₹{venue.price}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleBooking}
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
