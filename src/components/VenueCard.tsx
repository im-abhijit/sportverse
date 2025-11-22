import React from "react";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageLoader } from "@/hooks/use-image-loader";

interface VenueCardProps {
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  onBookClick?: () => void;
}

const VenueCard = React.memo<VenueCardProps>(({ name, location, price, rating, image, onBookClick }) => {
  const { imageSrc, isLoading } = useImageLoader({
    src: image,
    fallback: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
  });

  return (
    <Card className="overflow-hidden hover-lift group animate-in fade-in slide-in-from-bottom-4">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div>
          <h3 className="font-semibold text-base md:text-lg mb-1">{name}</h3>
          <div className="flex items-center text-xs md:text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            {location}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 md:h-4 md:w-4 fill-accent text-accent" />
            <span className="text-sm md:text-base font-medium">{rating}</span>
          </div>
        </div>
        
        <Button className="w-full text-sm md:text-base" onClick={onBookClick}>
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
});

VenueCard.displayName = "VenueCard";

export default VenueCard;
