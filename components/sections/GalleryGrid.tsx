"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  type: string;
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {items.map((item) => (
          <div
            key={item._id.toString()}
            className="group relative aspect-square rounded-lg overflow-hidden bg-background-secondary border border-border cursor-zoom-in"
            onClick={() => setSelected(item.image)}
          >
            <Image
              src={item.image}
              alt={item.title ?? "Gallery image"}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Link
                href="/custom-orders"
                onClick={(e) => e.stopPropagation()}
                className="bg-white text-foreground text-xs px-3 py-1.5 rounded-md font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Request Similar
              </Link>
            </div>
            {item.title && (
              <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent text-white text-xs px-2 py-2">
                {item.title}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-zoom-out"
          onClick={() => setSelected(null)}
        >
          <Image
            src={selected}
            alt="Full size"
            width={0}
            height={0}
            sizes="90vw"
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
