import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 md:h-12 md:w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-4 text-sm md:text-base text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

