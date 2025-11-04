import { useNavigate } from "react-router-dom";
import { Users, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";
import { useEffect, useState } from "react";
import { getVenuesByCity, type VenueDto } from "@/services/venuesApi";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
import heroImage from "@/assets/hero-sports.jpg";

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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Neobrutalist Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(210,100%,35%)] via-[hsl(150,70%,40%)] to-[hsl(210,100%,45%)]">
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroImage}
            alt="Sports venues"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        {/* Geometric shapes for neobrutalist feel */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[hsl(45,100%,55%)] opacity-30 rotate-12 shadow-neo animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-[hsl(150,70%,40%)] opacity-40 -rotate-12 shadow-neo animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative container mx-auto px-4 py-32 md:py-40">
          <div className="max-w-4xl mx-auto text-center mb-16 space-y-8">
            <div className="inline-block px-6 py-3 bg-white border-4 border-foreground shadow-neo mb-6 animate-slide-in-right">
              <span className="text-sm font-black uppercase tracking-wider text-foreground">⚡ Ready to Play</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight animate-fade-in">
              FIND & BOOK
              <br />
              <span className="bg-[hsl(45,100%,55%)] text-foreground px-4 py-2 inline-block border-4 border-foreground shadow-neo transform rotate-[-2deg]">
                SPORTS VENUES
              </span>
              <br />
              NEAR YOU
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/95 max-w-2xl mx-auto animate-slide-up">
              Discover premium sports venues for cricket, football, badminton and more
            </p>
          </div>
          <SearchBar
            onSearch={async (enteredCity) => {
              // Debug: verify Home receives search
              // eslint-disable-next-line no-console
              console.log("Home: onSearch city=", enteredCity);
              if (!enteredCity) return;
              setCity(enteredCity);
              setLoadingCity(true);
              setCityMsg("");
              try {
                const res = await getVenuesByCity(enteredCity);
                // eslint-disable-next-line no-console
                console.log("Home: API response", res);
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
                // eslint-disable-next-line no-console
                console.error("Home: API error", e);
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
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-[hsl(150,30%,97%)]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
                Venues in <span className="text-primary">{city}</span>
              </h2>
              <div className="hidden md:block w-16 h-16 bg-accent border-4 border-foreground shadow-neo rotate-12" />
            </div>
            {loadingCity ? (
              <p>Loading venues...</p>
            ) : cityVenues.length === 0 ? (
              <p className="text-muted-foreground">{cityMsg || "No venues found."}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cityVenues.map((v, index) => (
                  <VenueCard
                    key={v.id || index}
                    name={v.name}
                    location={v.city || v.address || v.addtress || ""}
                    price={v.price || 0}
                    rating={v.rating || 4.5}
                    image={(function () {
                      const p = v.photos && v.photos[0];
                      if (!p) return "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800";
                      if (p.startsWith("http")) return p;
                      if (p.startsWith("data:")) return p;
                      return `data:image/jpeg;base64,${p}`;
                    })()}
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

      {/* Features - Neobrutalist Cards */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-[hsl(150,70%,40%)] to-accent" />
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center mb-16">
            Why Choose <span className="text-primary">Sportverse?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white border-4 border-foreground shadow-neo p-8 hover-neo transition-all group"
                style={{ 
                  transform: index % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-primary to-[hsl(150,70%,40%)] border-4 border-foreground shadow-neo mb-6 group-hover:rotate-6 transition-transform">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
