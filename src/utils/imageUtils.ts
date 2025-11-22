/**
 * Utility functions for image handling and optimization
 */

/**
 * Converts base64 string to data URL format
 * @param base64String - Base64 encoded image string
 * @returns Data URL string or undefined
 */
export const getImageDataUrl = (base64String: string | undefined): string | undefined => {
  if (!base64String) return undefined;
  
  // If it's already a data URL, return as is
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Otherwise, add the data URL prefix
  // Try to detect image type from common base64 patterns, default to jpeg
  return `data:image/jpeg;base64,${base64String}`;
};

/**
 * Processes venue photo array and returns formatted image URLs
 * @param photos - Array of photo strings (base64 or URLs)
 * @param fallback - Fallback image URL
 * @returns Array of formatted image URLs
 */
export const processVenuePhotos = (photos: string[] | undefined, fallback?: string): string[] => {
  if (!photos || photos.length === 0) {
    return fallback ? [fallback] : [];
  }

  return photos.map((photo) => {
    if (!photo) return fallback || "";
    if (photo.startsWith("http") || photo.startsWith("data:")) return photo;
    return `data:image/jpeg;base64,${photo}`;
  });
};

/**
 * Gets the first venue photo with fallback
 * @param photos - Array of photo strings
 * @param fallback - Fallback image URL
 * @returns Formatted image URL
 */
export const getVenueImage = (photos: string[] | undefined, fallback: string = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"): string => {
  if (!photos || photos.length === 0) return fallback;
  
  const firstPhoto = photos[0];
  if (!firstPhoto) return fallback;
  if (firstPhoto.startsWith("http") || firstPhoto.startsWith("data:")) return firstPhoto;
  return `data:image/jpeg;base64,${firstPhoto}`;
};

