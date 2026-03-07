"use client";

import { useState, type ChangeEvent } from "react";
import { buildCloudinaryUrl, getCloudinaryUploadUrl } from "@/lib/cloudinary";

type Props = {
  label: string;
  value?: string;
  onChange: (publicId: string) => void;
};

export function ImageUploadField({ label, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "");

      const res = await fetch(getCloudinaryUploadUrl(), {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = (await res.json()) as { public_id: string };
      onChange(data.public_id);
    } catch (err) {
      setError("Image upload nahi ho saka. Dobara koshish karein.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const previewUrl = value ? buildCloudinaryUrl(value, { width: 300, quality: 80 }) : null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-saffron/90"
      />
      {uploading && (
        <p className="text-xs text-gray-500">Image upload ho rahi hai...</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="mt-2 h-24 w-full rounded-lg object-cover"
        />
      )}
    </div>
  );
}
