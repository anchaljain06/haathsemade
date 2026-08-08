import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { adminCreateProductSchema } from "@/schemas/zodValidations";
import { uniqueSlug } from "@/lib/slugify";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, adminCreateProductSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  await connectDB();

  const category = await Category.findById(data.categoryId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const product = await Product.create({
    ...data,
    slug: await uniqueSlug(Product, data.name),
  });

  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ product }, { status: 201 });
}
