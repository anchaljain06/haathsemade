import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { adminUpdateProductSchema } from "@/schemas/zodValidations";
import { uniqueSlug } from "@/lib/slugify";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const parsed = await parseBody(req, adminUpdateProductSchema);
  if (parsed.response) return parsed.response;
  const updates: Record<string, unknown> = { ...parsed.data };

  await connectDB();

  // Keep the slug in step with the name, but never collide with another product.
  if (typeof updates.name === "string") {
    updates.slug = await uniqueSlug(Product, updates.name, id);
  }

  // $set with a validated, whitelisted object — a raw body here would let
  // update operators through.
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await connectDB();

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
