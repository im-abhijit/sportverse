import { useMemo } from "react";
import { BookingResponse } from "@/services/bookingsApi";

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status";

interface UseBookingFiltersProps {
  bookings: BookingResponse[];
  filterDate: string;
  filterVenue: string;
  filterStatus: string;
  searchQuery: string;
  sortBy: SortOption;
}

export const useBookingFilters = ({
  bookings,
  filterDate,
  filterVenue,
  filterStatus,
  searchQuery,
  sortBy,
}: UseBookingFiltersProps) => {
  // Get unique venues from bookings
  const uniqueVenues = useMemo(() => {
    const venues = new Set<string>();
    bookings.forEach((booking) => {
      if (booking.venue?.name) {
        venues.add(booking.venue.name);
      }
    });
    return Array.from(venues).sort();
  }, [bookings]);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter((booking) => booking.date === filterDate);
    }

    // Filter by venue
    if (filterVenue !== "all") {
      filtered = filtered.filter((booking) => booking.venue?.name === filterVenue);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => {
        const status = getDisplayStatus(booking);
        return status.toLowerCase() === filterStatus.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((booking) =>
        booking.venue?.name?.toLowerCase().includes(query)
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "status":
          const statusA = getDisplayStatus(a);
          const statusB = getDisplayStatus(b);
          return statusA.localeCompare(statusB);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [bookings, filterDate, filterVenue, filterStatus, searchQuery, sortBy]);

  return {
    filteredBookings,
    uniqueVenues,
  };
};

// Helper function to get display status
export const getDisplayStatus = (booking: BookingResponse): string => {
  const bookingStatus = (booking.bookingStatus || "").toUpperCase();
  const paymentStatus = (booking.paymentStatus || "").toUpperCase();
  
  if (bookingStatus === "PAID" || paymentStatus === "SUCCESS") {
    return "Confirmed";
  }
  if (bookingStatus === "COMPLETED") {
    return "Completed";
  }
  if (bookingStatus === "CANCELLED" || paymentStatus === "FAILED") {
    return "Cancelled";
  }
  if (bookingStatus === "INITIATED" || paymentStatus === "PENDING") {
    return "Pending";
  }
  return bookingStatus || paymentStatus || "Pending";
};

