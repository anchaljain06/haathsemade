"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  type: string;
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % items.length : null
    );
  }, [items.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + items.length) % items.length : null
    );
  }, [items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  const currentItem =
    lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-4 mt-8">
        {items.map((item, index) => (
          <div
            key={item._id.toString()}
            className="group relative break-inside-avoid mb-4 rounded-lg overflow-hidden bg-background-secondary border border-border"
          >
            <div className="relative">
              <button
                onClick={() => setLightboxIndex(index)}
                className="w-full cursor-zoom-in"
                aria-label={`View ${item.title ?? "gallery image"} full size`}
              >
                <Image
                  src={item.image}
                  alt={item.title ?? "Gallery image"}
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="w-full h-auto object-cover"
                />
              </button>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <Link
                  href="/custom-orders"
                  className="bg-white text-foreground text-xs px-3 py-1.5 rounded-md font-medium hover:bg-primary hover:text-white transition-colors pointer-events-auto"
                >
                  Request Similar
                </Link>
              </div>
            </div>
            {item.title && (
              <div className="p-2">
                <p className="text-xs text-foreground-muted">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fadeIn"
            onClick={closeLightbox}
          />

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 md:left-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] z-[1] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentItem.image}
              alt={currentItem.title ?? "Gallery image"}
              width={0}
              height={0}
              sizes="90vw"
              className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              priority
            />
            {currentItem.title && (
              <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-sm px-4 py-3 rounded-b-lg">
                {currentItem.title}
              </p>
            )}
          </div>

          {/* Next Arrow */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 md:right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {lightboxIndex! + 1} / {items.length}
            </div>
          )}
        </div>
      )}

      {/* Lightbox animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
