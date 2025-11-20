import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Dashboard from "./pages/Dashboard";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerDashboard from "./pages/OwnerDashboard";
import EditVenue from "./pages/EditVenue";
import Booking from "./pages/Booking";
import ListVenue from "./pages/ListVenue";
import AddBooking from "./pages/AddBooking";
import PartnerVenueDetails from "./pages/PartnerVenueDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venue/:id" element={<VenueDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partner/login" element={<OwnerLogin />} />
          <Route path="/partner/dashboard" element={<OwnerDashboard />} />
          <Route path="/partner/edit-venue/:venueId" element={<EditVenue />} />
          <Route path="/partner/venue/:venueId" element={<PartnerVenueDetails />} />
          <Route path="/partner/list-venue" element={<ListVenue />} />
          <Route path="/partner/add-booking" element={<AddBooking />} />
          <Route path="/booking" element={<Booking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
