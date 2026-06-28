"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-background-secondary rounded-lg flex items-center justify-center text-foreground-muted">
        No Image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-background-secondary">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                selected === i ? "border-primary" : "border-border"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
