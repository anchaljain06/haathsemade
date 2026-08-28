import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import type { QueryFilter } from "mongoose";
import type { IProduct } from "@/models/Product";
import { parseInventoryMode, substringSearchFilter } from "@/lib/productSearch";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const category = req.nextUrl.searchParams.get("category");
    const mode = parseInventoryMode(req.nextUrl.searchParams.get("mode"));
    const sort = req.nextUrl.searchParams.get("sort");
    const q = req.nextUrl.searchParams.get("q");

    const parsedPage = Number.parseInt(
      req.nextUrl.searchParams.get("page") ?? "1",
      10
    );
    const parsedLimit = Number.parseInt(
      req.nextUrl.searchParams.get("limit") ?? "12",
      10
    );
    // Clamp so a hand-crafted ?page=-5&limit=99999 can't skew the query.
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 48)
        : 12;
    const skip = (page - 1) * limit;

    const query: QueryFilter<IProduct> = { isPublished: true };

    // $text is applied at query time rather than stored on `query`, so the
    // substring fallback below can reuse the same filters without it.
    const search = q?.trim();

    if (category) {
      // isActive matters: a deactivated category must stop filtering, not keep
      // quietly narrowing the catalogue.
      const categoryDoc = await Category.findOne({
        slug: category,
        isActive: true,
      });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      } else {
        return NextResponse.json({
          products: [],
          total: 0,
          page,
          totalPages: 0,
        });
      }
    }

    if (mode) {
      query.inventoryMode = mode;
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };

    const run = (filter: QueryFilter<IProduct>) =>
      Promise.all([
        Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

    let [products, total] = await run(
      search ? { ...query, $text: { $search: search } } : query
    );

    // Whole-word $text found nothing — retry as a substring match so "bouq"
    // still turns up "bouquet".
    if (search && total === 0) {
      [products, total] = await run({
        ...query,
        ...substringSearchFilter(search),
      });
    }

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}