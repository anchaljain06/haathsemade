import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { categoryUpdateSchema } from "@/schemas/zodValidations";
import { slugify } from "@/lib/slugify";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const parsed = await parseBody(req, categoryUpdateSchema);
  if (parsed.response) return parsed.response;
  const updates: Record<string, unknown> = { ...parsed.data };

  if (typeof updates.name === "string") {
    const slug = slugify(updates.name);
    if (!slug) {
      return NextResponse.json(
        { error: "Name must contain at least one letter or number" },
        { status: 400 }
      );
    }

    const clash = await Category.exists({ slug, _id: { $ne: id } });
    if (clash) {
      return NextResponse.json(
        { error: "Another category already uses that name" },
        { status: 409 }
      );
    }
    updates.slug = slug;
  }

  await connectDB();

  const category = await Category.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ category });
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await connectDB();

  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete category with existing products" },
      { status: 400 }
    );
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
