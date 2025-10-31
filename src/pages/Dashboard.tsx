import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { getBookingsByUser, type BookingResponse } from "@/services/bookingsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateUserProfile } from "@/services/usersApi";

const Dashboard = () => {
  const [name, setName] = useState("John Doe");
  const [phone, setPhone] = useState("+91 9876543210");
  const [city, setCity] = useState("Bareilly");
  const [saving, setSaving] = useState(false);

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prefill from localStorage if present
    const lsName = localStorage.getItem("userName");
    if (lsName) setName(lsName);
    const lsCity = localStorage.getItem("userCity");
    if (lsCity) setCity(lsCity);
    const lsPhone = localStorage.getItem("userPhoneNumber");
    if (lsPhone) setPhone(lsPhone);

    const userId = localStorage.getItem("userId") || "";
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getBookingsByUser(userId);
        if (resp.success && Array.isArray(resp.data)) {
          setBookings(resp.data);
        } else {
          setBookings([]);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const toDisplayStatus = (booking: BookingResponse): string => {
    const b = (booking.bookingStatus || "").toUpperCase();
    const p = (booking.paymentStatus || "").toUpperCase();
    if (b === "PAID" || p === "SUCCESS") return "confirmed";
    if (b === "COMPLETED") return "completed";
    if (b === "CANCELLED") return "cancelled";
    return (booking.bookingStatus || p || "").toString().toLowerCase() || "pending";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {loading && (
              <div className="text-sm text-muted-foreground">Loading bookings...</div>
            )}
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            {!loading && !error && bookings.length === 0 && (
              <div className="text-sm text-muted-foreground">No bookings found.</div>
            )}
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {booking.venue?.name || "Venue"}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {`${booking.venue?.city || ""}${booking.venue?.addtress ? ", " + booking.venue.addtress : ""}`}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(toDisplayStatus(booking))} text-white`}>
                            {toDisplayStatus(booking)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.date}
                          </div>
                          <div className="text-muted-foreground">
                            Slot: {Array.isArray(booking.slots) && booking.slots.length > 0
                              ? booking.slots.map(s => `${s.startTime} - ${s.endTime}`).join(", ")
                              : "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:flex-col md:items-end">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ₹{booking.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Amount
                          </div>
                        </div>
                        {toDisplayStatus(booking) === "confirmed" && (
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={city} onValueChange={(v) => setCity(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bareilly">Bareilly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="default"
                  disabled={saving}
                  onClick={async () => {
                    const userId = localStorage.getItem("userId") || "";
                    if (!userId) {
                      toast.error("Please log in to save changes");
                      return;
                    }
                    if (!name.trim() || !city.trim()) {
                      toast.error("Name and city are required");
                      return;
                    }
                    try {
                      setSaving(true);
                      const resp = await updateUserProfile(userId, name.trim(), city.trim(), phone);
                      if (resp.success) {
                        localStorage.setItem("userName", name.trim());
                        localStorage.setItem("userCity", city.trim());
                        toast.success(resp.message || "Profile updated");
                      } else {
                        toast.error(resp.message || "Failed to update profile");
                      }
                    } catch (e: any) {
                      toast.error(e?.message || "Could not update profile");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
