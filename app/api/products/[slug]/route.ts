import { NextRequest, NextResponse } from "next/server";
import { findProductBySlugOrId } from "@/lib/findProduct";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await findProductBySlugOrId(slug);

  if (!product || product.isPublished === false) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
