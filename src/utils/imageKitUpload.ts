import { upload } from "@imagekit/react";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/react";
import { getUploadToken } from "@/services/uploadApi";

const IMAGEKIT_PUBLIC_KEY = "public_S3F085TnvPk32i/4MDN04GQbC9A=";
/**
 * Upload image to ImageKit using backend-provided credentials and ImageKit React SDK
 * @param file - File object to upload
 * @param onProgress - Optional callback to track upload progress
 * @returns Promise resolving to the uploaded image URL
 */
export async function uploadImageToImageKit(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Step 1: Get upload token from backend API
    console.log("[ImageKit Upload] Step 1: Calling upload token API...");
    const { token, expire, signature } = await getUploadToken();
    console.log("[ImageKit Upload] Received credentials:", { token, expire, signature });
    
    // Use publicKey from config
    if (!IMAGEKIT_PUBLIC_KEY) {
      throw new Error("ImageKit public key is not configured.");
    }

    // Use expire value from backend as-is (convert string to number for ImageKit SDK)
    // Backend returns expire as Unix timestamp in seconds (as string)
    const expireTimestamp = parseInt(expire, 10);
    
    console.log("[ImageKit Upload] Using expire from backend:", { expire: expireTimestamp });

    // Step 2: Upload to ImageKit using the SDK with the credentials
    console.log("[ImageKit Upload] Step 2: Uploading to ImageKit...");
    const uploadResponse = await upload({
      file: file,
      fileName: file.name,
      token: token,
      expire: expireTimestamp,
      signature: signature,
      publicKey: IMAGEKIT_PUBLIC_KEY,
      onProgress: onProgress
        ? (event) => {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        : undefined,
    });
    
    console.log("[ImageKit Upload] Upload successful, URL:", uploadResponse.url);

    // Return the URL of the uploaded image
    if (uploadResponse.url) {
      return uploadResponse.url;
    } else {
      throw new Error("Upload response missing URL");
    }
  } catch (error) {
    // Handle specific ImageKit error types
    if (error instanceof ImageKitAbortError) {
      throw new Error(`Upload aborted: ${error.reason || error.message}`);
    } else if (error instanceof ImageKitInvalidRequestError) {
      throw new Error(`Invalid upload request: ${error.message}`);
    } else if (error instanceof ImageKitUploadNetworkError) {
      throw new Error(`Network error during upload: ${error.message}`);
    } else if (error instanceof ImageKitServerError) {
      throw new Error(`ImageKit server error: ${error.message}`);
    } else {
      // Handle other errors
      console.error("Error uploading image to ImageKit:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to upload image to ImageKit");
    }
  }
}

