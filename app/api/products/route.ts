import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const category = req.nextUrl.searchParams.get("category");
    const mode = req.nextUrl.searchParams.get("mode");
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

    const query: any = { isPublished: true };

    if (q?.trim()) {
      query.$text = { $search: q.trim() };
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
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

    let sortObj: any = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

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