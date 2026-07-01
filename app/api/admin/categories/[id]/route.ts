import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updateData: any = {};

  if (body.name !== undefined) {
    updateData.name = body.name;
    updateData.slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  if (body.image !== undefined) updateData.image = body.image;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  await connectDB();

  const category = await Category.findByIdAndUpdate(
    params.id,
    updateData,
    { new: true }
  );

  return NextResponse.json({ category });
}

export async function DELETE(
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const productCount = await Product.countDocuments({ categoryId: params.id });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete category with existing products" },
      { status: 400 }
    );
  }

  await Category.findByIdAndDelete(params.id);

  return NextResponse.json({ success: true });
}