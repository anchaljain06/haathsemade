"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { X, Upload } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  value,
  onChange,
  maxFiles = 5,
}: ImageUploadProps) {
  function handleUpload(result: any) {
    const url = result?.info?.secure_url;
    if (url) {
      onChange([...value, url]);
    }
  }

  function handleRemove(urlToRemove: string) {
    onChange(value.filter((url) => url !== urlToRemove));
  }

  return (
    <div className="space-y-3">
      {/* Uploaded images preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-md overflow-hidden border border-border group"
            >
              <Image src={url} alt="Uploaded" fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxFiles && (
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          options={{
            maxFiles: maxFiles - value.length,
            sources: ["local", "url"],
            multiple: true,
          }}
          onSuccess={handleUpload}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="flex items-center gap-2 border border-dashed border-border rounded-md px-4 py-3 text-sm text-foreground-muted hover:border-primary hover:text-primary transition-colors w-full justify-center"
            >
              <Upload className="w-4 h-4" />
              Upload Image{maxFiles > 1 ? "s" : ""}
            </button>
          )}
        </CldUploadWidget>
      )}

      <p className="text-xs text-foreground-muted">
        {value.length} / {maxFiles} images uploaded
      </p>
    </div>
  );
}