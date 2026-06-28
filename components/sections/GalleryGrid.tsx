import Image from "next/image";
import Link from "next/link";

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  type: string;
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="columns-2 md:columns-3 gap-4 mt-8">
      {items.map((item) => (
        <div
          key={item._id.toString()}
          className="group relative break-inside-avoid mb-4 rounded-lg overflow-hidden bg-background-secondary border border-border"
        >
          <div className="relative">
            <Image
              src={item.image}
              alt={item.title ?? "Gallery image"}
              width={400}
              height={400}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Link
                href="/custom-orders"
                className="bg-white text-foreground text-xs px-3 py-1.5 rounded-md font-medium hover:bg-primary hover:text-white transition-colors"
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
  );
}
