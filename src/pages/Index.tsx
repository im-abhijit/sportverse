import { useNavigate } from "react-router-dom";
import { Users, Zap, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";
import heroImage from "@/assets/hero-sports.jpg";

const Index = () => {
  const navigate = useNavigate();

  const topVenues = [
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
  ];

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
          <SearchBar />
        </div>
      </section>


      {/* Top Venues */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Top Venues</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topVenues.map((venue, index) => (
              <VenueCard
                key={index}
                {...venue}
                onBookClick={() => navigate(`/venue/${index + 1}`)}
              />
            ))}
          </div>
        </div>
      </section>

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

export default Index;
