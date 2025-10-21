"use client";

import { useRef } from "react";
import { useFileUpload } from "@/hooks";

/**
 * Refactored Avatar Upload Page using custom hooks
 *
 * BEFORE: 60 lines with manual state management
 * AFTER: ~40 lines with loading and error states built-in
 */
export default function AvatarUploadPageRefactored() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { uploadedFile, isUploading, error, uploadFile, reset } =
    useFileUpload("/api/avatar/upload");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      return;
    }

    const file = inputFileRef.current.files[0];
    await uploadFile(file);
  };

  return (
    <div className="grid gap-2 p-4">
      <h1 className="text-xl font-semibold">Upload Your Avatar</h1>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="border rounded border-gray-300 p-1"
          name="file"
          ref={inputFileRef}
          type="file"
          accept="image/jpeg, image/png, image/webp"
          required
          disabled={isUploading}
        />
        <button
          className="border rounded border-green-700 p-1 bg-green-200 cursor-pointer dark:text-green-950 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {uploadedFile && (
          <button
            className="border rounded border-gray-700 p-1 bg-gray-200 cursor-pointer dark:text-gray-950"
            type="button"
            onClick={reset}
          >
            Reset
          </button>
        )}
      </form>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success message */}
      {uploadedFile && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">Upload successful!</p>
          <p className="text-sm">
            Blob url: <a href={uploadedFile.url} className="underline">{uploadedFile.url}</a>
          </p>
        </div>
      )}
    </div>
  );
}
