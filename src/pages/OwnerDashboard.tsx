import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Bookings",
      value: "127",
      icon: Calendar,
      trend: "+12%",
      color: "text-primary",
    },
    {
      title: "Total Earnings",
      value: "₹1,52,400",
      icon: DollarSign,
      trend: "+18%",
      color: "text-green-500",
    },
    {
      title: "Active Venues",
      value: "3",
      icon: TrendingUp,
      trend: "+1",
      color: "text-accent",
    },
  ];

  const myVenues = [
    {
      name: "Elite Sports Arena",
      location: "Mumbai, Maharashtra",
      bookings: 45,
      earnings: "₹54,000",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
      name: "Pro Football Turf",
      location: "Delhi, NCR",
      bookings: 38,
      earnings: "₹38,000",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    },
    {
      name: "Ace Badminton Courts",
      location: "Pune, Maharashtra",
      bookings: 44,
      earnings: "₹35,200",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Venue Owner Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your venues and track performance
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/list-venue")}>
            <Plus className="h-5 w-5 mr-2" />
            Add New Venue
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <span className="text-sm font-medium text-green-500">
                    {stat.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Venues */}
        <Card>
          <CardHeader>
            <CardTitle>My Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myVenues.map((venue, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border hover:border-primary transition-colors"
                >
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{venue.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {venue.location}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bookings: </span>
                        <span className="font-medium">{venue.bookings}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Earnings: </span>
                        <span className="font-medium text-primary">
                          {venue.earnings}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Button variant="outline" className="flex-1 md:flex-none">
                      Edit
                    </Button>
                    <Button variant="ghost" className="flex-1 md:flex-none">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
