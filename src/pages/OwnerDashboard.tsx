import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Plus, TrendingUp, Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getVenuesByPartner, VenueDto } from "@/services/venuesApi";
import { getImageDataUrl } from "@/utils/imageUtils";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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


  const stats = [
    {
      title: "Total Bookings",
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      onClick: () => navigate("/partner/bookings"),
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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Hero Section - Different for Mobile and Web */}
        {/* Mobile Hero */}
        <div className="block lg:hidden mb-4">
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
        <div className="hidden lg:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/5 border-2 border-blue-200/50 dark:border-blue-800/50 p-6 lg:p-8 mb-6 md:mb-8">
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
        <div className="block lg:hidden mb-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
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
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
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


        {/* My Venues - Mobile: Compact Cards */}
        <div className="block lg:hidden">
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
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-2.5">
                  <div className="flex gap-2.5">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-1.5">
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-7 w-20" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No venues yet"
              description="Add your first venue to get started"
              action={{
                label: "Add Venue",
                onClick: () => navigate("/partner/list-venue"),
              }}
            />
          ) : (
            <div className="space-y-2">
              {venues.map((venue) => {
                const venueId = venue.id || "";
                const venueImage = venue.thumbnailUrl 
                  ? venue.thumbnailUrl
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
                            onClick={() => navigate(`/partner/venue/${venueId}`)}
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
        <Card className="hidden lg:block border-2 shadow-lg border-blue-200/50 dark:border-blue-800/50">
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
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-2xl border-2 overflow-hidden">
                    <div className="flex flex-row gap-0">
                      <Skeleton className="w-56 lg:w-64 h-[180px]" />
                      <div className="flex-1 p-6 lg:p-8 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No venues yet"
                description="Start by adding your first venue to begin managing bookings"
                action={{
                  label: "Add Your First Venue",
                  onClick: () => navigate("/partner/list-venue"),
                }}
              />
            ) : (
              <div className="space-y-5">
                {venues.map((venue) => {
                  const venueId = venue.id || "";
                  const venueImage = venue.thumbnailUrl 
                    ? venue.thumbnailUrl
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
                                onClick={() => navigate(`/partner/venue/${venueId}`)}
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
        <div className="fixed bottom-6 right-6 lg:hidden z-50">
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
