import { useState } from "react";
import type { PutBlobResult } from "@vercel/blob";

/**
 * Custom hook for handling file uploads with loading and error states
 *
 * @param uploadUrl - API endpoint for file upload
 * @returns Object with upload state and upload function
 *
 * @example
 * ```tsx
 * const { uploadedFile, isUploading, error, uploadFile } =
 *   useFileUpload('/api/avatar/upload');
 *
 * // Upload a file
 * const handleSubmit = async (file: File) => {
 *   const result = await uploadFile(file);
 *   if (result) {
 *     console.log('Upload successful:', result.url);
 *   }
 * };
 * ```
 */
export function useFileUpload(uploadUrl: string) {
  const [uploadedFile, setUploadedFile] = useState<PutBlobResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<PutBlobResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(`${uploadUrl}?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = (await response.json()) as PutBlobResult;
      setUploadedFile(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setError(null);
  };

  return {
    uploadedFile,
    isUploading,
    error,
    uploadFile,
    reset,
  };
}
