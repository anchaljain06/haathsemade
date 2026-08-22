//google optimisation in website

import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

// Without this the sitemap is prerendered once at build time, so a new product
// is invisible to crawlers until the next deploy. Hourly is plenty for a
// catalogue this size.
export const revalidate = 3600;

/** The narrow shape .select() actually returns for the URL entries below. */
type SitemapDoc = {
  _id: unknown;
  slug?: string;
  updatedAt: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find({ isPublished: true }).select("_id slug updatedAt").lean(),
    Category.find({ isActive: true }).select("slug updatedAt").lean(),
  ]);

  const productUrls = products.map((p: SitemapDoc) => ({
    url: `${baseUrl}/products/${p.slug ?? p._id}`,
    lastModified: new Date(p.updatedAt),
  }));

  const categoryUrls = categories.map((c: SitemapDoc) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
    lastModified: new Date(c.updatedAt),
  }));

  const staticPages = [
    "/",
    "/products",
    "/categories",
    "/gallery",
    "/about",
    "/contact",
    "/custom-orders",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productUrls, ...categoryUrls];
}