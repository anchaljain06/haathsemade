import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { galleryCreateSchema } from "@/schemas/zodValidations";
import GalleryItem from "@/models/GalleryItem";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, galleryCreateSchema);
  if (parsed.response) return parsed.response;
  const { images, type, title } = parsed.data;

  await connectDB();

  const createdItems = await GalleryItem.insertMany(
    images.map((url) => ({
      image: url,
      type,
      ...(title ? { title } : {}),
      isApproved: true,
    }))
  );

  revalidatePath("/gallery");

  return NextResponse.json({ success: true, items: createdItems }, { status: 201 });
}
