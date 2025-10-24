import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VenueCardProps {
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  onBookClick?: () => void;
}

const VenueCard = ({ name, location, price, rating, image, onBookClick }: VenueCardProps) => {
  return (
    <Card className="overflow-hidden hover-lift group">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{rating}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-primary">₹{price}</div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
        </div>
        
        <Button className="w-full" onClick={onBookClick}>
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
