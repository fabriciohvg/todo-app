"use client";

import type { PutBlobResult } from "@vercel/blob";
import { useState, useRef } from "react";

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  return (
    <div className="grid gap-2 p-4">
      <h1 className="text-xl font-semibold">Upload Your Avatar</h1>

      <form
        className="flex flex-col items-start md:flex-row md:items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          const response = await fetch(
            `/api/avatar/upload?filename=${file.name}`,
            {
              method: "POST",
              body: file,
            }
          );

          const newBlob = (await response.json()) as PutBlobResult;

          setBlob(newBlob);
        }}
      >
        <label className="border rounded border-gray-700 py-1 px-4 hover:bg-gray-100 hover:text-black dark:border-gray-100 cursor-pointer">
          Upload Avatar
          <input
            className="opacity-0 absolute inset-0 cursor-pointer"
            name="file"
            ref={inputFileRef}
            type="file"
            hidden
            accept="image/jpeg, image/png, image/webp"
            required
          />
        </label>

        <button
          className="border rounded border-green-700 py-1 px-4 bg-green-200 cursor-pointer hover:bg-green-100 dark:text-green-950"
          type="submit"
        >
          Upload
        </button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </div>
  );
}
