import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { categoryCreateSchema } from "@/schemas/zodValidations";
import { slugify } from "@/lib/slugify";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, categoryCreateSchema);
  if (parsed.response) return parsed.response;
  const { name, image } = parsed.data;

  const slug = slugify(name);
  if (!slug) {
    return NextResponse.json(
      { error: "Name must contain at least one letter or number" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await Category.findOne({ slug });
  if (existing) {
    return NextResponse.json(
      { error: "Category already exists" },
      { status: 409 }
    );
  }

  const category = await Category.create({
    name,
    slug,
    image: image ?? "",
    isActive: true,
  });

  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return NextResponse.json({ category }, { status: 201 });
}
