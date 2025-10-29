import { useNavigate } from "react-router-dom";
import { Users, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";
import { useEffect, useState } from "react";
import { getVenuesByCity, type VenueDto } from "@/services/venuesApi";
import { getSlotsByVenueAndDate } from "@/services/slotsApi";
import heroImage from "@/assets/hero-sports.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [cityVenues, setCityVenues] = useState<VenueDto[]>([]);
  const [loadingCity, setLoadingCity] = useState(false);
  const [cityMsg, setCityMsg] = useState<string>("");

  // Removed Top Venues mock list

  // Restore last search results when navigating back from details
  useEffect(() => {
    try {
      const savedCity = sessionStorage.getItem("sv:lastCity");
      const savedVenues = sessionStorage.getItem("sv:lastVenues");
      if (savedCity && savedVenues) {
        setCity(savedCity);
        const parsed = JSON.parse(savedVenues);
        if (Array.isArray(parsed)) setCityVenues(parsed as VenueDto[]);
      }
    } catch {
      // ignore parse errors
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <img
          src={heroImage}
          alt="Sports venues"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg animate-fade-in">
              Find & Book Sports Venues Near You
            </h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md animate-slide-up">
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
                try {
                  sessionStorage.setItem("sv:lastCity", enteredCity);
                  sessionStorage.setItem("sv:lastVenues", JSON.stringify(list));
                } catch {}
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
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Venues in {city}</h2>
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

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Sportverse?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
