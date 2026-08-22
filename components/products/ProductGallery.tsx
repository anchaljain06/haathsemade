"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import Lightbox from "@/components/shared/Lightbox";

const HOVER_SCALE = 1.9;

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-background-secondary rounded-lg flex items-center justify-center text-foreground-muted">
        No Image
      </div>
    );
  }

  // Magnifier: keep the point under the cursor fixed while scaling up.
  function trackPointer(e: React.MouseEvent) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        ref={frameRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={trackPointer}
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-square rounded-lg overflow-hidden bg-background-secondary cursor-zoom-in"
      >
        <Image
          src={images[selected]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="object-cover transition-transform duration-200 ease-out"
          style={{
            transform: hovering ? `scale(${HOVER_SCALE})` : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        />

        {/* Affordance — hidden while magnifying so it doesn't sit over the art. */}
        <span
          className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-opacity ${
            hovering ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Expand className="w-3.5 h-3.5" />
          Click to enlarge
        </span>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={selected === i}
              className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                selected === i ? "border-primary" : "border-border"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          index={selected}
          alt={name}
          onIndexChange={setSelected}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
