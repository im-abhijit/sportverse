/**
 * Utility functions for image handling and optimization
 */

/**
 * Gets image URL (handles URLs directly, no base64 conversion)
 * @param imageString - Image URL string
 * @returns Image URL string or undefined
 */
export const getImageDataUrl = (imageString: string | undefined): string | undefined => {
  if (!imageString) return undefined;
  
  // If it's already a data URL (from file uploads), return as is
  if (imageString.startsWith('data:')) {
    return imageString;
  }
  
  // Return URL as-is (no base64 conversion)
  return imageString;
};

/**
 * Processes venue photo array and returns formatted image URLs
 * @param photos - Array of photo URL strings
 * @param fallback - Fallback image URL
 * @returns Array of formatted image URLs
 */
export const processVenuePhotos = (photos: string[] | undefined, fallback?: string): string[] => {
  if (!photos || photos.length === 0) {
    return fallback ? [fallback] : [];
  }

  return photos.map((photo) => {
    if (!photo) return fallback || "";
    // Return URL as-is (no base64 conversion)
    if (photo.startsWith("http") || photo.startsWith("data:")) return photo;
    // If it's not a URL or data URL, treat as URL (backend now sends URLs)
    return photo;
  });
};

/**
 * Gets the first venue photo with fallback
 * @param photos - Array of photo URL strings
 * @param fallback - Fallback image URL
 * @returns Formatted image URL
 */
export const getVenueImage = (photos: string[] | undefined, fallback: string = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"): string => {
  if (!photos || photos.length === 0) return fallback;
  
  const firstPhoto = photos[0];
  if (!firstPhoto) return fallback;
  // Return URL as-is (no base64 conversion)
  if (firstPhoto.startsWith("http") || firstPhoto.startsWith("data:")) return firstPhoto;
  // If it's not a URL or data URL, treat as URL (backend now sends URLs)
  return firstPhoto;
};

