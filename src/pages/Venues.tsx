import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import VenueCard from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Venues = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([500, 2000]);

  const venues = [
    {
      name: "Elite Sports Arena",
      location: "Mumbai, Maharashtra",
      price: 1200,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
      name: "Champions Cricket Ground",
      location: "Bangalore, Karnataka",
      price: 1500,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    },
    {
      name: "Pro Football Turf",
      location: "Delhi, NCR",
      price: 1000,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    },
    {
      name: "Ace Badminton Courts",
      location: "Pune, Maharashtra",
      price: 800,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    },
    {
      name: "Victory Sports Complex",
      location: "Hyderabad, Telangana",
      price: 1100,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800",
    },
    {
      name: "Premier Tennis Academy",
      location: "Chennai, Tamil Nadu",
      price: 900,
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800",
    },
  ];

  const sports = ["Cricket", "Football", "Badminton", "Tennis", "Basketball"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Venue</h1>
            <p className="text-muted-foreground">Showing {venues.length} venues</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`w-full md:w-64 space-y-6 ${
              showFilters ? "block" : "hidden md:block"
            }`}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </h3>
                </div>

                <div>
                  <Label className="mb-4 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    min={500}
                    max={2000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-4"
                  />
                </div>

                <div>
                  <Label className="mb-4 block font-semibold">Sport Type</Label>
                  <div className="space-y-3">
                    {sports.map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox id={sport} />
                        <Label htmlFor={sport} className="cursor-pointer font-normal">
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-4 block font-semibold">Rating</Label>
                  <div className="space-y-3">
                    {[4.5, 4.0, 3.5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox id={`rating-${rating}`} />
                        <Label
                          htmlFor={`rating-${rating}`}
                          className="cursor-pointer font-normal"
                        >
                          {rating}+ Stars
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="default" className="w-full">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Venues Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <VenueCard
                  key={index}
                  {...venue}
                  onBookClick={() => navigate(`/venue/${index + 1}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venues;
