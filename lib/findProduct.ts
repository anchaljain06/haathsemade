import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

/** A product as returned by `.lean()` — ids and dates already plain values. */
export interface LeanProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description: string;
  images: string[];
  price: number;
  categoryId: mongoose.Types.ObjectId;
  inventoryMode: "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";
  isCustomizable: boolean;
  estimatedCraftTime: string;
  stock: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resolves a product from a URL segment.
 *
 * Slugs are canonical, but ObjectIds are accepted as a fallback so links and
 * sitemap entries minted before the slug migration keep working.
 */
export async function findProductBySlugOrId(
  identifier: string
): Promise<LeanProduct | null> {
  if (!identifier) return null;

  await connectDB();

  const bySlug = await Product.findOne({ slug: identifier }).lean<LeanProduct>();
  if (bySlug) return bySlug;

  if (mongoose.isValidObjectId(identifier)) {
    return Product.findById(identifier).lean<LeanProduct>();
  }

  return null;
}
