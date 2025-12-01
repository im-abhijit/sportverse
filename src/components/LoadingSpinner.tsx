import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: "150px",
    md: "200px",
    lg: "300px",
  };

  const sizeValue = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* @ts-ignore - dotlottie-wc is a web component loaded via script */}
      <dotlottie-wc
        src="https://lottie.host/a2251891-5535-4223-a990-229ad8719798/TZCkBQFfb5.lottie"
        style={{ width: sizeValue, height: sizeValue }}
        autoplay
        loop
      />
      {text && (
        <p className="mt-4 text-sm md:text-base text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

