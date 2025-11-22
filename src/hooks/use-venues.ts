import { useQuery } from "@tanstack/react-query";
import { getVenuesByCity, getVenuesByPartner, type VenueDto } from "@/services/venuesApi";

export const useVenuesByCity = (city: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["venues", "city", city],
    queryFn: () => getVenuesByCity(city),
    enabled: enabled && !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useVenuesByPartner = (partnerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["venues", "partner", partnerId],
    queryFn: () => getVenuesByPartner(partnerId),
    enabled: enabled && !!partnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

