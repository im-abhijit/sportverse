import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Filter, X, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { getBookingsByPartner, confirmBooking, type BookingResponse } from "@/services/bookingsApi";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import { useBookingFilters, type SortOption, getDisplayStatus } from "@/hooks/use-booking-filters";
import BookingCard from "@/components/BookingCard";

const PartnerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);

  // Filter states
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterVenue, setFilterVenue] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileBookingView, setMobileBookingView] = useState<"all" | "confirmed" | "pending">("all");

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use custom hook for filtering
  const { filteredBookings, uniqueVenues } = useBookingFilters({
    bookings,
    filterDate,
    filterVenue,
    filterStatus,
    searchQuery: debouncedSearchQuery,
    sortBy,
  });

  // Separate bookings into confirmed and pending
  const { confirmedBookings, pendingBookings } = useMemo(() => {
    const confirmed: BookingResponse[] = [];
    const pending: BookingResponse[] = [];

    filteredBookings.forEach((booking) => {
      const status = (booking as any).status?.toUpperCase() || "";
      const paymentStatus = (booking.paymentStatus || "").toUpperCase();
      const bookingStatus = (booking.bookingStatus || "").toUpperCase();

      // Check if booking is confirmed
      if (
        status === "SUCCESS" ||
        paymentStatus === "SUCCESS" ||
        bookingStatus === "PAID" ||
        bookingStatus === "COMPLETED"
      ) {
        confirmed.push(booking);
      } else {
        // Everything else is pending
        pending.push(booking);
      }
    });

    return { confirmedBookings: confirmed, pendingBookings: pending };
  }, [filteredBookings]);

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

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      const partnerId = localStorage.getItem("partnerId");
      if (!partnerId) {
        setError("Partner ID not found. Please login again.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getBookingsByPartner(partnerId);
        if (response.success && response.data) {
          setBookings(response.data);
          toast.success("Bookings loaded successfully");
        } else {
          setError(response.message || "Failed to fetch bookings");
          setBookings([]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Memoized callbacks
  const clearFilters = useCallback(() => {
    setFilterDate("");
    setFilterVenue("all");
    setFilterStatus("all");
    setSearchQuery("");
    toast.success("Filters cleared");
  }, []);

  const handleFilterToggle = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleMobileFilterToggle = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    // Create CSV content
    const headers = ["Venue Name", "Date", "Status", "Slots", "Total Amount"];
    const rows = filteredBookings.map(booking => {
      const slots = booking.slots.map(s => `${s.startTime}-${s.endTime}`).join(", ");
      const status = getDisplayStatus(booking);
      return [
        booking.venue?.name || "Unknown",
        format(new Date(booking.date), "dd MMM yyyy"),
        status,
        slots,
        `₹${booking.amount}`
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings exported successfully");
  }, [filteredBookings]);

  const handleConfirmBooking = useCallback(async (bookingId: string) => {
    if (!bookingId) {
      toast.error("Booking ID is required");
      return;
    }

    setConfirmingBookingId(bookingId);
    try {
      const response = await confirmBooking(bookingId);
      if (response.success) {
        toast.success(response.message || "Booking confirmed successfully");
        
        // Refresh bookings list
        const partnerId = localStorage.getItem("partnerId");
        if (partnerId) {
          const refreshResponse = await getBookingsByPartner(partnerId);
          if (refreshResponse.success && refreshResponse.data) {
            setBookings(refreshResponse.data);
          }
        }
      } else {
        toast.error(response.message || "Failed to confirm booking");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm booking. Please try again.");
    } finally {
      setConfirmingBookingId(null);
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "cancelled":
      case "failed":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  }, []);

  // Use getDisplayStatus from hook
  const getDisplayStatusMemo = useCallback((booking: BookingResponse): string => {
    return getDisplayStatus(booking);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filterDate || filterVenue !== "all" || filterStatus !== "all" || searchQuery.trim() !== "";
  }, [filterDate, filterVenue, filterStatus, searchQuery]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filterDate) {
      chips.push({
        label: `Date: ${format(new Date(filterDate), "dd MMM yyyy")}`,
        onRemove: () => setFilterDate(""),
      });
    }
    if (filterVenue !== "all") {
      chips.push({
        label: `Venue: ${filterVenue}`,
        onRemove: () => setFilterVenue("all"),
      });
    }
    if (filterStatus !== "all") {
      chips.push({
        label: `Status: ${filterStatus}`,
        onRemove: () => setFilterStatus("all"),
      });
    }
    if (searchQuery.trim()) {
      chips.push({
        label: `Search: ${searchQuery}`,
        onRemove: () => setSearchQuery(""),
      });
    }
    return chips;
  }, [filterDate, filterVenue, filterStatus, searchQuery]);

  // Filter section component
  const FilterSection = () => (
    <Card className="mb-6 transition-all animate-in fade-in slide-in-from-top-2">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="search-venue">Search Venue</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-venue"
                type="text"
                placeholder="Search by venue name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search bookings by venue name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-date">Filter by Date</Label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
                aria-label="Filter bookings by date"
              />
            </div>

            {/* Venue Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-venue">Filter by Venue</Label>
              <Select value={filterVenue} onValueChange={setFilterVenue}>
                <SelectTrigger id="filter-venue" className="w-full" aria-label="Filter bookings by venue">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {uniqueVenues.map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status" className="w-full" aria-label="Filter bookings by status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Option */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger id="sort-by" className="w-full" aria-label="Sort bookings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredBookings.length}</span> of{" "}
              <span className="font-semibold text-foreground">{bookings.length}</span> bookings
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/partner/dashboard")}
                className="lg:hidden"
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">My Bookings</h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                  Manage and view all bookings for your venues
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleFilterToggle}
                className="flex items-center gap-2"
                aria-label="Toggle filters"
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
                aria-label="Export bookings to CSV"
                disabled={filteredBookings.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                  aria-label="Clear all filters"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => navigate("/partner/dashboard")}
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {activeFilterChips.map((chip, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mobile/Tablet Filter Toggle */}
        <div className="lg:hidden mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMobileFilterToggle}
            className="flex-1 flex items-center justify-center gap-2"
            aria-label="Toggle filters"
            aria-expanded={showMobileFilters}
          >
            <Filter className="h-4 w-4" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            size="icon"
            aria-label="Export bookings to CSV"
            disabled={filteredBookings.length === 0}
          >
            <Download className="h-4 w-4" />
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              size="icon"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterSection />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filters */}
        {showFilters && <FilterSection />}

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="space-y-3 md:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 md:p-5 lg:p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                      <div className="pt-2 border-t space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                      <Skeleton className="h-8 w-24 md:w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-4 md:p-6 text-center animate-in fade-in">
            <p className="text-sm md:text-base text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} aria-label="Retry loading bookings">
              Retry
            </Button>
          </Card>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {filteredBookings.length === 0 ? (
              <Card className="p-6 md:p-8 lg:p-12 text-center animate-in fade-in">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Calendar className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-muted-foreground/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <X className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2">
                    {hasActiveFilters ? "No bookings match your filters" : "No bookings found"}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 max-w-md">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results"
                      : "Bookings will appear here once customers make reservations"}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline" size="sm" className="md:size-default">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                {/* Mobile: Dropdown to select booking type */}
                <div className="lg:hidden mb-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Label htmlFor="booking-view">View Bookings</Label>
                        <Select value={mobileBookingView} onValueChange={(value) => setMobileBookingView(value as "all" | "confirmed" | "pending")}>
                          <SelectTrigger id="booking-view" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Bookings ({filteredBookings.length})
                            </SelectItem>
                            <SelectItem value="confirmed">
                              Confirmed ({confirmedBookings.length})
                            </SelectItem>
                            <SelectItem value="pending">
                              Pending ({pendingBookings.length})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile View: Show selected booking type */}
                <div className="lg:hidden space-y-4">
                  {(mobileBookingView === "all" || mobileBookingView === "confirmed") && confirmedBookings.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-green-500 rounded-full"></div>
                        <h2 className="text-lg font-bold">Confirmed Bookings</h2>
                        <Badge className="bg-green-500 text-white">
                          {confirmedBookings.length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {confirmedBookings.map((booking, index) => (
                          <div
                            key={booking.id}
                            className="animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <BookingCard
                              booking={booking}
                              getStatusColor={getStatusColor}
                              getDisplayStatus={getDisplayStatusMemo}
                              showConfirmButton={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(mobileBookingView === "all" || mobileBookingView === "pending") && pendingBookings.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                        <h2 className="text-lg font-bold">Pending Bookings</h2>
                        <Badge className="bg-yellow-500 text-white">
                          {pendingBookings.length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {pendingBookings.map((booking, index) => (
                          <div
                            key={booking.id}
                            className="animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <BookingCard
                              booking={booking}
                              getStatusColor={getStatusColor}
                              getDisplayStatus={getDisplayStatusMemo}
                              onConfirm={handleConfirmBooking}
                              isConfirming={confirmingBookingId === booking.id}
                              showConfirmButton={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for mobile */}
                  {mobileBookingView === "confirmed" && confirmedBookings.length === 0 && (
                    <Card className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No confirmed bookings found</p>
                    </Card>
                  )}
                  {mobileBookingView === "pending" && pendingBookings.length === 0 && (
                    <Card className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No pending bookings found</p>
                    </Card>
                  )}
                </div>

                {/* Desktop/Tablet View: Two column layout */}
                <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8">
                  {/* Confirmed Bookings Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-green-500">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <h2 className="text-xl xl:text-2xl font-bold">Confirmed Bookings</h2>
                      <Badge className="bg-green-500 text-white">
                        {confirmedBookings.length}
                      </Badge>
                    </div>
                    {confirmedBookings.length > 0 ? (
                      <div className="space-y-3 xl:space-y-4">
                        {confirmedBookings.map((booking, index) => (
                          <div
                            key={booking.id}
                            className="animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <BookingCard
                              booking={booking}
                              getStatusColor={getStatusColor}
                              getDisplayStatus={getDisplayStatusMemo}
                              showConfirmButton={false}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">No confirmed bookings</p>
                      </Card>
                    )}
                  </div>

                  {/* Pending Bookings Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-yellow-500">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <h2 className="text-xl xl:text-2xl font-bold">Pending Bookings</h2>
                      <Badge className="bg-yellow-500 text-white">
                        {pendingBookings.length}
                      </Badge>
                    </div>
                    {pendingBookings.length > 0 ? (
                      <div className="space-y-3 xl:space-y-4">
                        {pendingBookings.map((booking, index) => (
                          <div
                            key={booking.id}
                            className="animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <BookingCard
                              booking={booking}
                              getStatusColor={getStatusColor}
                              getDisplayStatus={getDisplayStatusMemo}
                              onConfirm={handleConfirmBooking}
                              isConfirming={confirmingBookingId === booking.id}
                              showConfirmButton={true}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">No pending bookings</p>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerBookings;
