import { useState, useEffect } from "react";

interface UseImageLoaderOptions {
  src: string | undefined;
  fallback?: string;
}

export const useImageLoader = ({ src, fallback }: UseImageLoaderOptions) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src || fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);

    // Handle base64 images
    if (src.startsWith("data:") || src.startsWith("/")) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Handle external URLs
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setImageSrc(fallback);
      setIsLoading(false);
    };
    img.src = src;
  }, [src, fallback]);

  return { imageSrc, isLoading, error };
};

