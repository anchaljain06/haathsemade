import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { galleryUpdateSchema } from "@/schemas/zodValidations";
import GalleryItem from "@/models/GalleryItem";
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
  // Without this a non-ObjectId path segment throws a CastError, i.e. a 500
  // for what is really a bad request.
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const parsed = await parseBody(req, galleryUpdateSchema);
  if (parsed.response) return parsed.response;

  await connectDB();

  const item = await GalleryItem.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true }
  );

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  revalidatePath("/gallery");
  return NextResponse.json({ item });
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
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const item = await GalleryItem.findByIdAndDelete(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  revalidatePath("/gallery");
  return NextResponse.json({ success: true });
}
