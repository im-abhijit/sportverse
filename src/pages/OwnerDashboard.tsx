import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";
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

// Helper function to convert base64 string to data URL
const getImageDataUrl = (base64String: string | undefined): string | undefined => {
  if (!base64String) return undefined;
  
  // If it's already a data URL, return as is
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Otherwise, add the data URL prefix
  // Try to detect image type from common base64 patterns, default to jpeg
  return `data:image/jpeg;base64,${base64String}`;
};

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
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      onClick: handleFetchBookings,
    },
    {
      title: "Add a new booking",
      icon: Plus,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      onClick: () => navigate("/partner/add-booking"),
    },
    {
      title: "Active Venues",
      value: venues.length.toString(),
      icon: TrendingUp,
      gradient: "from-blue-400 to-green-500",
      bgGradient: "from-blue-50 via-green-50 to-green-100 dark:from-blue-950 dark:via-green-950 dark:to-green-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-green-50/30 dark:from-blue-950/20 dark:via-background dark:to-green-950/20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Hero Section - Different for Mobile and Web */}
        {/* Mobile Hero */}
        <div className="block md:hidden mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                Dashboard
            </h1>
            </div>
            <Button 
              variant="hero" 
              size="sm"
              className="shadow-md"
              onClick={() => navigate("/partner/list-venue")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Venue
            </Button>
          </div>
        </div>

        {/* Web Hero */}
        <div className="hidden md:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/5 border-2 border-blue-200/50 dark:border-blue-800/50 p-6 lg:p-8 mb-8">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 dark:from-blue-400 dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Partner Dashboard
                  </h1>
                </div>
                <p className="text-base lg:text-lg text-muted-foreground">
                  Manage your venues, bookings, and grow your business
                </p>
              </div>
              <Button 
                variant="hero" 
                size="lg"
                className="shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                onClick={() => navigate("/partner/list-venue")}
              >
            <Plus className="h-5 w-5 mr-2" />
            Add New Venue
          </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Quick Actions - Mobile: Small Compact Tiles */}
        <div className="block md:hidden mb-4">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
                  stat.onClick 
                    ? "cursor-pointer active:scale-95 border-blue-200 dark:border-blue-800" 
                    : "border-blue-200 dark:border-blue-800"
                } bg-gradient-to-br ${stat.bgGradient}`}
                onClick={stat.onClick}
              >
                <div className="p-2.5 relative z-10">
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${stat.gradient} shadow-sm mb-2`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground leading-tight mb-1">{stat.title}</p>
                  {stat.value ? (
                    <p className="text-base font-bold text-foreground">{stat.value}</p>
                  ) : (
                    <p className="text-[9px] text-muted-foreground/70">Tap</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Web: Large Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                stat.onClick 
                  ? "cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] border-transparent hover:border-blue-500/50" 
                  : "border-transparent"
              } bg-gradient-to-br ${stat.bgGradient}`}
              onClick={stat.onClick}
            >
              <div className="p-6 lg:p-8 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 lg:p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  {stat.onClick && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm lg:text-base font-medium text-muted-foreground">{stat.title}</p>
                  {stat.value ? (
                    <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/80 mt-1">Click to view</p>
                  )}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          ))}
        </div>

        {/* Bookings Dialog - Mobile optimized */}
        <Dialog open={showBookingsDialog} onOpenChange={setShowBookingsDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-3 sm:pb-4">
              <DialogTitle className="text-lg sm:text-xl">Total Bookings</DialogTitle>
            </DialogHeader>
            <div className="mt-2 sm:mt-4">
              {isLoadingBookings ? (
                <div className="text-center py-8">
                  <p className="text-sm sm:text-base text-muted-foreground">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm sm:text-base text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-3 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{booking.venue.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {booking.venue.addtress || booking.venue.city}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-2">
                            <p className="font-bold text-lg sm:text-xl">₹{booking.amount}</p>
                            {booking.bookingStatus && (
                              <span className={`text-xs sm:text-sm font-medium capitalize px-2 py-1 rounded ${
                                booking.bookingStatus === "PAID" || booking.bookingStatus === "CONFIRMED" 
                                  ? "text-green-700 bg-green-50 dark:bg-green-900/20" :
                                booking.bookingStatus === "FAILED" 
                                  ? "text-red-700 bg-red-50 dark:bg-red-900/20" :
                                  "text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20"
                              }`}>
                                {booking.bookingStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
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
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Time Slots:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {booking.slots.map((slot, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-muted rounded-md text-xs sm:text-sm"
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

        {/* My Venues - Mobile: Compact Cards */}
        <div className="block md:hidden">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold">My Venues</h2>
            {venues.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
                {venues.length}
              </span>
            )}
          </div>
          {isLoadingVenues ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : venues.length === 0 ? (
            <Card className="p-4 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">No venues yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first venue to get started</p>
              <Button 
                onClick={() => navigate("/partner/list-venue")}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Venue
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {venues.map((venue) => {
                const venueId = venue.id || "";
                const venueImage = venue.photos && venue.photos.length > 0 
                  ? getImageDataUrl(venue.photos[0])
                  : undefined;
                const venueLocation = venue.addtress || venue.address || venue.city || "";

                return (
                  <Card 
                    key={venueId}
                    className="p-2.5 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex gap-2.5">
                      {venueImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={venueImage}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1 mb-0.5">{venue.name}</h3>
                        {venueLocation && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                            {venueLocation}
                          </p>
                        )}
                        <div className="flex gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-7 px-2 text-xs flex-1"
                            onClick={() => navigate(`/partner/edit-venue/${venueId}`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 px-2 text-xs flex-1"
                            onClick={() => navigate(`/venue/${venueId}`)}
                          >
                            View
                          </Button>
                      </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* My Venues - Web: Enhanced Design */}
        <Card className="hidden md:block border-2 shadow-lg border-blue-200/50 dark:border-blue-800/50">
          <CardHeader className="pb-6 border-b border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                  My Venues
                </CardTitle>
                {venues.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    {venues.length}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 lg:p-8">
            {isLoadingVenues ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-base text-muted-foreground">Loading venues...</p>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 mb-6">
                  <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
                <p className="text-base text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start by adding your first venue to begin managing bookings
                </p>
                    <Button 
                  onClick={() => navigate("/partner/list-venue")}
                  className="shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Venue
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {venues.map((venue) => {
                  const venueId = venue.id || "";
                  const venueImage = venue.photos && venue.photos.length > 0 
                    ? getImageDataUrl(venue.photos[0])
                    : undefined;
                  const venueLocation = venue.addtress || venue.address || venue.city || "";

                  return (
                    <div
                      key={venueId}
                      className="group relative overflow-hidden rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 bg-card transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex flex-row gap-0">
                        {venueImage && (
                          <div className="w-56 lg:w-64 h-auto min-h-[180px] rounded-l-2xl overflow-hidden flex-shrink-0 relative">
                            <img
                              src={venueImage}
                              alt={venue.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                        )}
                        <div className="flex-1 p-6 lg:p-8">
                          <div className="flex flex-row items-start justify-between gap-4">
                            <div className="flex-1 space-y-2 min-w-0">
                              <h3 className="font-bold text-xl lg:text-2xl line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {venue.name}
                              </h3>
                              {venue.description && (
                                <p className="text-base text-muted-foreground line-clamp-2">
                                  {venue.description}
                                </p>
                              )}
                              {venueLocation && (
                                <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                                  <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                  <span className="line-clamp-1">{venueLocation}</span>
                                </div>
                              )}
                              {venue.games && venue.games.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {venue.games.slice(0, 3).map((game, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                                    >
                                      {game}
                                    </span>
                                  ))}
                                  {venue.games.length > 3 && (
                                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm font-medium">
                                      +{venue.games.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 pl-5 ml-5 border-l border-blue-200/50 dark:border-blue-800/50">
                    <Button 
                      variant="outline" 
                                size="sm"
                                className="w-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-600 hover:text-white hover:border-transparent transition-all"
                                onClick={() => navigate(`/partner/edit-venue/${venueId}`)}
                    >
                      Edit
                    </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="w-full hover:bg-gradient-to-r hover:from-blue-100 hover:to-green-100 dark:hover:from-blue-900 dark:hover:to-green-900 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                                onClick={() => navigate(`/venue/${venueId}`)}
                              >
                      View
                    </Button>
                  </div>
                </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            onClick={() => navigate("/partner/add-booking")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
