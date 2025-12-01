import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageTransition } from "@/components/PageTransition";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Venues = lazy(() => import("./pages/Venues"));
const VenueDetails = lazy(() => import("./pages/VenueDetails"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OwnerLogin = lazy(() => import("./pages/OwnerLogin"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const EditVenue = lazy(() => import("./pages/EditVenue"));
const Booking = lazy(() => import("./pages/Booking"));
const ListVenue = lazy(() => import("./pages/ListVenue"));
const AddBooking = lazy(() => import("./pages/AddBooking"));
const PartnerVenueDetails = lazy(() => import("./pages/PartnerVenueDetails"));
const PartnerBookings = lazy(() => import("./pages/PartnerBookings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Home />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/venues" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Venues />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/venue/:id" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <VenueDetails />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/login" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <OwnerLogin />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/dashboard" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <OwnerDashboard />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/edit-venue/:venueId" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <EditVenue />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/venue/:venueId" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <PartnerVenueDetails />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/list-venue" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <ListVenue />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/add-booking" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <AddBooking />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/partner/bookings" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <PartnerBookings />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/booking" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Booking />
              </PageTransition>
            </Suspense>
          } 
        />
        <Route 
          path="/privacy-policy" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <PrivacyPolicy />
              </PageTransition>
            </Suspense>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <NotFound />
              </PageTransition>
            </Suspense>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
