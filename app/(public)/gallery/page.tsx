import { connectDB } from "@/lib/db";
import GalleryItem from "@/models/GalleryItem";
import GalleryGrid from "@/components/sections/GalleryGrid";

async function getGalleryItems(type?: string) {
  await connectDB();
  const query: any = { isApproved: true };
  if (type) query.type = type;
  const items = await GalleryItem.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(items));
}

export const metadata = {
  title: "Gallery — Handmade Boutique",
  description: "Browse our work and get inspired for your next custom order.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "memories" ? "CUSTOMER_MEMORY" : "INSPIRATION";
  const items = await getGalleryItems(tab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl text-foreground mb-3">Gallery</h1>
        <p className="text-foreground-muted">
          Browse our work and get inspired
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <a
          href="/gallery"
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "INSPIRATION"
              ? "bg-primary text-white"
              : "border border-border text-foreground-muted hover:border-primary hover:text-primary"
          }`}
        >
          Inspiration
        </a>
        <a
          href="/gallery?tab=memories"
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "CUSTOMER_MEMORY"
              ? "bg-primary text-white"
              : "border border-border text-foreground-muted hover:border-primary hover:text-primary"
          }`}
        >
          Customer Memories
        </a>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-foreground-muted">
          Nothing here yet. Check back soon!
        </div>
      ) : (
        <GalleryGrid items={items as any} />
      )}
    </div>
  );
}
