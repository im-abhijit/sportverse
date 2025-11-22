import React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { BookingResponse } from "@/services/bookingsApi";

interface BookingCardProps {
  booking: BookingResponse;
  getStatusColor: (status: string) => string;
  getDisplayStatus: (booking: BookingResponse) => string;
  onConfirm?: (bookingId: string) => void;
  isConfirming?: boolean;
  showConfirmButton?: boolean;
}

const BookingCard = React.memo<BookingCardProps>(({ 
  booking, 
  getStatusColor, 
  getDisplayStatus,
  onConfirm,
  isConfirming = false,
  showConfirmButton = false,
}) => {
  const displayStatus = getDisplayStatus(booking);
  const isPending = displayStatus.toLowerCase() === "pending";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-4 md:p-5 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 lg:gap-6">
          {/* Left Section - Booking Details */}
          <div className="flex-1 space-y-2 md:space-y-3">
            <div className="flex items-start justify-between gap-3 md:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg lg:text-xl font-bold line-clamp-2">
                  {booking.venue?.name || "Unknown Venue"}
                </h3>
              </div>
              <Badge className={`${getStatusColor(displayStatus)} flex-shrink-0 text-xs md:text-sm`}>
                {displayStatus}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs sm:text-sm md:text-base">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                {format(new Date(booking.date), "dd MMM yyyy")}
              </div>
              <div className="text-muted-foreground">
                {booking.slots.length} slot{booking.slots.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Time Slots */}
            <div className="pt-2 border-t">
              <p className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 font-medium">
                Time Slots:
              </p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {booking.slots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-muted rounded-md text-xs md:text-sm"
                  >
                    {slot.startTime} - {slot.endTime} (₹{slot.price})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Amount and Confirm Button */}
          <div className="flex items-center justify-between md:flex-col md:items-end md:justify-start gap-3 md:gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 lg:pl-6 md:pb-0">
            <div className="text-right md:text-left">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                ₹{booking.amount}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Total Amount
              </div>
            </div>
            {/* Confirm Button - Only show for pending bookings */}
            {showConfirmButton && isPending && onConfirm && (
              <Button
                onClick={() => onConfirm(booking.id)}
                disabled={isConfirming}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;

