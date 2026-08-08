import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import GalleryItem from "@/models/GalleryItem";
import Order from "@/models/Order";
import ProductCard from "@/components/products/ProductCard";
import CategoryCard from "@/components/products/CategoryCard";
import GalleryGrid from "@/components/sections/GalleryGrid";
import { serialize } from "@/lib/serialize";
import { BRAND } from "@/lib/brand";

const CARD_FIELDS =
  "name slug price images inventoryMode estimatedCraftTime stock isCustomizable description";

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  openGraph: {
    title: BRAND.name,
    description: "Handcrafted with love, delivered with care.",
    type: "website",
  },
};

/** Top sellers by units actually ordered; empty until orders exist. */
async function getBestSellers(limit: number) {
  const rows = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.productId": { $ne: null } } },
    { $group: { _id: "$items.productId", sold: { $sum: "$items.quantity" } } },
    { $sort: { sold: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r._id);
  const products = await Product.find({ _id: { $in: ids }, isPublished: true })
    .select(CARD_FIELDS)
    .lean();

  // Preserve the aggregation's ranking, which $in does not.
  const order = new Map(ids.map((id, i) => [String(id), i]));
  return products.sort(
    (a: any, b: any) =>
      (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)
  );
}

async function getHomepageData() {
  await connectDB();

  const [newArrivals, madeToOrder, bestSellers, categories, galleryItems] =
    await Promise.all([
      // Newest first.
      Product.find({ isPublished: true })
        .select(CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
      // A genuinely different cut, not a relabelled copy of the same query.
      Product.find({ isPublished: true, inventoryMode: "MADE_TO_ORDER" })
        .select(CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
      getBestSellers(4),
      Category.find({ isActive: true }).select("name slug image").limit(8).lean(),
      GalleryItem.find({ isApproved: true })
        .select("image title type")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

  return serialize({
    newArrivals,
    madeToOrder,
    bestSellers,
    categories,
    galleryItems,
  });
}

export default async function HomePage() {
  const { newArrivals, madeToOrder, bestSellers, categories, galleryItems } =
    await getHomepageData();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-background-secondary py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
            Handcrafted with Love
          </p>
          <h1 className="font-heading text-5xl md:text-7xl text-foreground mb-6 leading-tight">
            Beautiful Things,
            <br />
            Made by Hand
          </h1>
          <p className="text-foreground-muted text-lg max-w-xl mx-auto mb-10">
            Each piece is crafted with care and attention to detail — from
            bouquets to resin art, made just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-primary text-white px-8 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
            <Link
              href="/custom-orders"
              className="border border-primary text-primary px-8 py-3 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Custom Order
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh from the workshop"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {newArrivals.map((p: any, i: number) => (
                <ProductCard key={p._id} product={p} priority={i < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 px-4 bg-background-secondary">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Browse by Category" subtitle="Find what speaks to you" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {categories.map((c: any) => (
                <CategoryCard key={c._id} category={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Best Sellers" subtitle="Loved by our customers" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {bestSellers.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Made to Order */}
      {madeToOrder.length > 0 && (
        <section className="py-16 px-4 bg-background-secondary">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="Made to Order"
              subtitle="Crafted for you after you order — tell us what you need"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {madeToOrder.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {galleryItems.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Our Work" subtitle="A glimpse into our craft" />
            <GalleryGrid items={galleryItems} />
            <div className="text-center mt-8">
              <Link
                href="/gallery"
                className="text-primary text-sm font-medium hover:underline"
              >
                View Full Gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Custom Order CTA */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl text-white mb-4">
            Something Special in Mind?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            We bring your ideas to life. Share your vision and we'll craft
            something truly unique for you.
          </p>
          <Link
            href="/custom-orders"
            className="bg-white text-primary px-8 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start a Custom Order
          </Link>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-16 px-4 bg-background-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl text-foreground mb-3">
            Share Your Memories
          </h2>
          <p className="text-foreground-muted mb-6">
            Tag us on Instagram and be featured on our page.
          </p>
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-sm font-medium hover:underline"
          >
            {BRAND.instagramHandle} →
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl text-foreground mb-2">{title}</h2>
      <p className="text-foreground-muted text-sm">{subtitle}</p>
    </div>
  );
}
