import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getBookingsByPartner, BookingResponse } from "@/services/bookingsApi";
import { getVenuesByPartner, VenueDto } from "@/services/venuesApi";
import { format } from "date-fns";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [showBookingsDialog, setShowBookingsDialog] = useState(false);
  const [venues, setVenues] = useState<VenueDto[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);

  // Check authentication on mount and route changes
  useEffect(() => {
    const partnerId = localStorage.getItem("partnerId");
    const isPartnerLoggedIn = localStorage.getItem("isPartnerLoggedIn");
    
    if (!partnerId || isPartnerLoggedIn !== "true") {
      toast.error("Please login to access the dashboard");
      navigate("/partner/login");
      return;
    }
  }, [navigate, location.pathname]);

  // Fetch venues whenever dashboard is loaded or navigated to
  useEffect(() => {
    const fetchVenues = async () => {
      const partnerId = localStorage.getItem("partnerId");
      const isPartnerLoggedIn = localStorage.getItem("isPartnerLoggedIn");
      
      // Double check authentication before fetching
      if (!partnerId || isPartnerLoggedIn !== "true") {
        return; // Will be handled by auth check above
      }

      setIsLoadingVenues(true);
      try {
        const response = await getVenuesByPartner(partnerId);
        if (response.success && response.data) {
          const venuesList = Array.isArray(response.data) ? response.data : [response.data];
          setVenues(venuesList);
          // Store venues in localStorage for reuse in AddBooking
          localStorage.setItem("partnerVenues", JSON.stringify(venuesList));
        } else {
          toast.error(response.message || "Failed to fetch venues");
          setVenues([]);
          localStorage.removeItem("partnerVenues");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load venues");
        setVenues([]);
        localStorage.removeItem("partnerVenues");
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [navigate, location.pathname]); // Refetch when navigating to dashboard

  const handleFetchBookings = async () => {
    const partnerId = localStorage.getItem("partnerId");
    if (!partnerId) {
      toast.error("Partner ID not found. Please login again.");
      return;
    }

    setIsLoadingBookings(true);
    setShowBookingsDialog(true);
    try {
      const response = await getBookingsByPartner(partnerId);
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        toast.error(response.message || "Failed to fetch bookings");
        setBookings([]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const stats = [
    {
      title: "Total Bookings",
      icon: Calendar,
      color: "text-primary",
      onClick: handleFetchBookings,
    },
    {
      title: "Add a new booking",
      icon: Plus,
      color: "text-primary",
      onClick: () => navigate("/partner/add-booking"),
    },
    {
      title: "Total Earnings",
      value: "₹1,52,400",
      icon: DollarSign,
      trend: "+18%",
      color: "text-green-500",
    },
    {
      title: "Active Venues",
      value: venues.length.toString(),
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Venue Owner Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your venues and track performance
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/partner/list-venue")}>
            <Plus className="h-5 w-5 mr-2" />
            Add New Venue
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={stat.onClick ? "cursor-pointer hover:shadow-lg hover:border-primary transition-all active:scale-95" : ""}
              onClick={stat.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  {stat.trend && (
                    <span className="text-xs font-medium text-green-500">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {stat.value && <p className="text-2xl font-bold">{stat.value}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings Dialog */}
        <Dialog open={showBookingsDialog} onOpenChange={setShowBookingsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Total Bookings</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {isLoadingBookings ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.venue.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.venue.addtress || booking.venue.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{booking.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.bookingStatus && (
                                <span className={`capitalize ${
                                  booking.bookingStatus === "PAID" || booking.bookingStatus === "CONFIRMED" ? "text-green-600" :
                                  booking.bookingStatus === "FAILED" ? "text-red-600" :
                                  "text-yellow-600"
                                }`}>
                                  {booking.bookingStatus}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">
                              {format(new Date(booking.date), "dd MMM yyyy")}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Slots: </span>
                            <span className="font-medium">
                              {booking.slots.length} slot{booking.slots.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          {booking.bookingStatus && (
                            <div>
                              <span className="text-muted-foreground">Status: </span>
                              <span className={`font-medium capitalize ${
                                booking.bookingStatus === "PAID" || booking.bookingStatus === "CONFIRMED" ? "text-green-600" :
                                booking.bookingStatus === "FAILED" ? "text-red-600" :
                                "text-yellow-600"
                              }`}>
                                {booking.bookingStatus}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Time Slots:</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.slots.map((slot, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-muted rounded-md text-sm"
                              >
                                {slot.startTime} - {slot.endTime} (₹{slot.price})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* My Venues */}
        <Card>
          <CardHeader>
            <CardTitle>My Venues</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingVenues ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading venues...</p>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No venues found</p>
                <Button onClick={() => navigate("/partner/list-venue")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Venue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => {
                  const venueId = venue.id || "";
                  const venueImage = venue.photos && venue.photos.length > 0 
                    ? `data:image/jpeg;base64,${venue.photos[0]}` 
                    : undefined;
                  const venueLocation = venue.addtress || venue.address || venue.city || "";

                  return (
                    <div
                      key={venueId}
                      className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border hover:border-primary transition-colors"
                    >
                      {venueImage && (
                        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden">
                          <img
                            src={venueImage}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{venue.name}</h3>
                        {venue.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {venue.description}
                          </p>
                        )}
                        {venueLocation && (
                          <p className="text-sm text-muted-foreground">
                            {venueLocation}
                          </p>
                        )}
                        {venue.games && venue.games.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {venue.games.map((game, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-muted rounded-md text-xs"
                              >
                                {game}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 md:flex-none"
                          onClick={() => navigate(`/partner/edit-venue/${venueId}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 md:flex-none"
                          onClick={() => navigate(`/venue/${venueId}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
