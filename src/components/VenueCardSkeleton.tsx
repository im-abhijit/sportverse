import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const VenueCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
};

