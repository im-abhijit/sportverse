import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Booking = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const bookingDetails = {
    venue: "Elite Sports Arena",
    location: "Andheri West, Mumbai",
    date: "February 15, 2025",
    slot: "18:00 - 19:00",
    price: 1200,
  };

  const handlePayment = () => {
    // Simulate payment
    setTimeout(() => {
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12 space-y-6">
              <div className="inline-flex p-4 rounded-full bg-green-500/10">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold">Booking Successful!</h1>
              <p className="text-muted-foreground">
                Your venue has been booked successfully. You'll receive a
                confirmation email shortly.
              </p>
              
              <div className="p-6 rounded-2xl bg-muted text-left space-y-2">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Venue:</span>
                  <span className="font-medium">{bookingDetails.venue}</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{bookingDetails.date}</span>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{bookingDetails.slot}</span>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium text-primary">₹{bookingDetails.price}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="hero" onClick={() => navigate("/dashboard")}>
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {bookingDetails.venue}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingDetails.location}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{bookingDetails.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time Slot:</span>
                    <span className="font-medium">{bookingDetails.slot}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price/Hour:</span>
                    <span className="font-medium">₹{bookingDetails.price}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-primary text-xl">
                      ₹{bookingDetails.price}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-6 rounded-xl border-2 border-dashed border-muted text-center">
                  <p className="text-muted-foreground">
                    Payment integration will be available soon
                  </p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                >
                  Complete Booking
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By clicking "Complete Booking", you agree to our Terms of
                  Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
