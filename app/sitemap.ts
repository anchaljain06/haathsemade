//google optimisation in website

import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find({ isPublished: true }).select("_id updatedAt").lean(),
    Category.find({ isActive: true }).select("slug updatedAt").lean(),
  ]);

  const productUrls = products.map((p: any) => ({
    url: `${baseUrl}/products/${p._id}`,
    lastModified: new Date(p.updatedAt),
  }));

  const categoryUrls = categories.map((c: any) => ({
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