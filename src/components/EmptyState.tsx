import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <Card className={`p-6 md:p-8 lg:p-12 text-center animate-in fade-in ${className || ""}`}>
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <Icon className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-muted-foreground/50" />
        </div>
        <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline" size="sm" className="md:size-default">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

