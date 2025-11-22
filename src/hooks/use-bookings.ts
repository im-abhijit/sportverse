import { useQuery } from "@tanstack/react-query";
import { getBookingsByPartner, getBookingsByUserMobile, type BookingResponse } from "@/services/bookingsApi";

export const useBookingsByPartner = (partnerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["bookings", "partner", partnerId],
    queryFn: () => getBookingsByPartner(partnerId),
    enabled: enabled && !!partnerId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBookingsByUserMobile = (mobileNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["bookings", "user", mobileNumber],
    queryFn: () => getBookingsByUserMobile(mobileNumber),
    enabled: enabled && !!mobileNumber && mobileNumber.trim().length >= 10,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

