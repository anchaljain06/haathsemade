"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "@/components/shared/Lightbox";

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  type: string;
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const images = items.map((i) => i.image);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {items.map((item, i) => (
          <div
            key={item._id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-background-secondary border border-border cursor-zoom-in"
            onClick={() => setOpenAt(i)}
          >
            <Image
              src={item.image}
              alt={item.title ?? "Gallery image"}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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

      {openAt !== null && (
        <Lightbox
          images={images}
          index={openAt}
          alt={items[openAt]?.title ?? "Gallery image"}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
