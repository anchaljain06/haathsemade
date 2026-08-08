import { cache } from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { findProductBySlugOrId } from "@/lib/findProduct";
import { serialize } from "@/lib/serialize";
import { BRAND } from "@/lib/brand";
import ProductGallery from "@/components/products/ProductGallery";
import ProductActions from "@/components/products/ProductActions";
import ProductCard from "@/components/products/ProductCard";

/**
 * Wrapped in `cache()` so generateMetadata and the page component share one
 * result instead of each running the queries independently.
 */
const getProduct = cache(async (identifier: string) => {
  const product = await findProductBySlugOrId(identifier);
  if (!product || !product.isPublished) return null;

  await connectDB();

  const [category, suggested] = await Promise.all([
    Category.findById(product.categoryId).select("name slug").lean(),
    Product.find({
      isPublished: true,
      categoryId: product.categoryId,
      _id: { $ne: product._id },
    })
      .select("name slug price images inventoryMode estimatedCraftTime stock isCustomizable")
      .limit(4)
      .lean(),
  ]);

  return serialize({ product, category, suggested });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Product Not Found" };

  const p = data.product as any;
  return {
    title: `${p.name} — ${BRAND.name}`,
    description: p.description,
    alternates: { canonical: `/products/${p.slug ?? p._id}` },
    openGraph: {
      title: p.name,
      description: p.description,
      images: p.images?.[0] ? [{ url: p.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { category, suggested } = data;
  const p = data.product as any;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <ProductGallery images={p.images} name={p.name} />

        {/* Product Info */}
        <div>
          {category && (
            <p className="text-primary text-xs font-medium tracking-widest uppercase mb-3">
              {(category as any).name}
            </p>
          )}
          <h1 className="font-heading text-4xl text-foreground mb-3">
            {p.name}
          </h1>
          <p className="text-3xl text-primary font-medium mb-6">
            ₹{p.price.toLocaleString()}
          </p>
          <p className="text-foreground-muted text-sm leading-relaxed mb-6">
            {p.description}
          </p>

          {p.estimatedCraftTime && (
            <div className="bg-background-secondary rounded-md px-4 py-3 text-sm text-foreground-muted mb-6">
              ⏱ Estimated craft time: <strong>{p.estimatedCraftTime}</strong>
            </div>
          )}

          {/* Actions based on inventory mode */}
          <ProductActions product={p} />

          {/* Shipping Info */}
          <div className="mt-8 border-t border-border pt-6 space-y-3 text-sm text-foreground-muted">
            <p>🚚 Ships within 1-2 days for ready stock</p>
            <p>📦 Carefully packed to ensure safe delivery</p>
            <p>💬 Questions? Chat with us on WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Suggested Products */}
      {suggested.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggested.map((s: any) => (
              <ProductCard key={s._id} product={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
