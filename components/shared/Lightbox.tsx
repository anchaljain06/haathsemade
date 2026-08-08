"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ZOOM_SCALE = 2.25;

/**
 * Full-screen image viewer with click-to-zoom, drag-to-pan, arrow-key
 * navigation and Escape to close. Shared by the product gallery and the
 * inspiration gallery so both behave identically.
 */
export default function Lightbox({
  images,
  index,
  alt,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  // Transform origin as a percentage, so zoom magnifies wherever the pointer is.
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const hasMultiple = images.length > 1;

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setZoomed(false);
    onIndexChange((index + 1) % images.length);
  }, [hasMultiple, index, images.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setZoomed(false);
    onIndexChange((index - 1 + images.length) % images.length);
  }, [hasMultiple, index, images.length, onIndexChange]);

  // Keyboard: Escape closes, arrows navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev]);

  // Don't let the page scroll behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function trackPointer(e: React.MouseEvent) {
    if (!zoomed) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — enlarged view`}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setZoomed((z) => !z);
        }}
        aria-label={zoomed ? "Zoom out" : "Zoom in"}
        className="absolute top-4 right-16 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
      </button>

      {hasMultiple && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        ref={frameRef}
        onClick={(e) => {
          e.stopPropagation();
          setZoomed((z) => !z);
        }}
        onMouseMove={trackPointer}
        className={`relative w-[92vw] h-[86vh] overflow-hidden ${
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={alt}
          fill
          sizes="92vw"
          priority
          className="object-contain transition-transform duration-200 ease-out"
          style={{
            transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        />
      </div>

      {hasMultiple && (
        <p className="absolute bottom-5 text-white/70 text-xs tracking-wide">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
