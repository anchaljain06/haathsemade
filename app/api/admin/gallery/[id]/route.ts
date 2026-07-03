import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
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
  const { isApproved } = await req.json();

  await connectDB();

  const item = await GalleryItem.findByIdAndUpdate(
    id,
    { isApproved },
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

  await connectDB();

  const item = await GalleryItem.findByIdAndDelete(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  revalidatePath("/gallery");
  return NextResponse.json({ success: true });
}
