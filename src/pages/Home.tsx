import { useNavigate } from "react-router-dom";
import { Users, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";
import { VenueCardSkeleton } from "@/components/VenueCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useEffect, useState, useCallback } from "react";
import { getVenuesByCity, type VenueDto } from "@/services/venuesApi";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
import heroImage from "@/assets/hero-sports.jpg";
import { Calendar } from "lucide-react";
import { getVenueImage } from "@/utils/imageUtils";

// In-memory cache for last search within SPA navigation (resets on full reload)
let lastSearchCityMemory: string = "";
let lastSearchVenuesMemory: VenueDto[] = [];

const Home = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [cityVenues, setCityVenues] = useState<VenueDto[]>([]);
  const [loadingCity, setLoadingCity] = useState(false);
  const [cityMsg, setCityMsg] = useState<string>("");

  // Removed Top Venues mock list

  // Restore last search results when navigating back from details (memory only)
  useEffect(() => {
    if (lastSearchCityMemory && Array.isArray(lastSearchVenuesMemory)) {
      setCity(lastSearchCityMemory);
      setCityVenues(lastSearchVenuesMemory);
    }
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book your favorite venue in seconds with our seamless booking system",
    },
    {
      icon: Shield,
      title: "Verified Venues",
      description: "All venues are verified and maintained to the highest standards",
    },
    {
      icon: Users,
      title: "Community",
      description: "Join thousands of sports enthusiasts booking venues daily",
    },
  ];

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <img
          src={heroImage}
          alt="Sports venues"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12 space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg animate-fade-in">
              FIND & BOOK
              <br />
              <span className="bg-accent text-accent-foreground px-4 py-2 inline-block rounded-lg transform rotate-[-2deg]">
                SPORTS VENUES
              </span>
              <br />
              NEAR YOU
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-white/95 drop-shadow-md animate-slide-up">
              Discover premium sports venues for cricket, football, badminton and more
            </p>
          </div>
          <SearchBar
            onSearch={async (enteredCity) => {
              if (!enteredCity) return;
              setCity(enteredCity);
              setLoadingCity(true);
              setCityMsg("");
              try {
                const res = await getVenuesByCity(enteredCity);
                const data = res.data;
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setCityVenues(list as VenueDto[]);
                // Update in-memory cache (survives navigation, resets on reload)
                lastSearchCityMemory = enteredCity;
                lastSearchVenuesMemory = list as VenueDto[];
                if (!res.success) {
                  setCityMsg(res.message || "No venues found");
                } else if ((list as VenueDto[]).length === 0) {
                  setCityMsg("No venues found");
                }
              } catch (e) {
                setCityVenues([]);
                // Surface a friendly message in UI
                setCityMsg("Could not load venues for this city right now. Please try again.");
              } finally {
                setLoadingCity(false);
              }
            }}
          />
        </div>
      </section>


      {/* Venues by City (moved outside Hero) */}
      {city && (
        <section className="py-12 md:py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Venues in {city}</h2>
            </div>
            {loadingCity ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <VenueCardSkeleton key={i} />
                ))}
              </div>
            ) : cityVenues.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No venues found"
                description={cityMsg || "Try searching for a different city or check back later."}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {cityVenues.map((v, index) => (
                  <VenueCard
                    key={v.id || index}
                    name={v.name}
                    location={v.city || v.address || v.addtress || ""}
                    price={v.price || 0}
                    rating={v.rating || 4.5}
                    image={v.thumbnailUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"}
                    onBookClick={async () => {
                      // Build today's local date string
                      const now = new Date();
                      const yyyy = now.getFullYear();
                      const mm = String(now.getMonth() + 1).padStart(2, "0");
                      const dd = String(now.getDate()).padStart(2, "0");
                      const today = `${yyyy}-${mm}-${dd}`;

                      let prefetchedSlots: any[] = [];
                      try {
                        if (v.id) {
                          const res = await getSlotsByVenueAndDate(v.id as string, today);
                          prefetchedSlots = res.data?.slots || [];
                        }
                      } catch (_) {
                        prefetchedSlots = [];
                      }

                      navigate(`/venue/${(v.id as string) || String(index + 1)}` as string, {
                        state: { ...v, venueId: v.id, prefetchedSlots, prefetchedDate: today },
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Top Venues section removed */}

      {/* Features */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            Why Choose Sportverse?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Partners</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Partner with Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">List Your Venue</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Sportverse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
