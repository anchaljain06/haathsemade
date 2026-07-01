import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import GalleryItem from "@/models/GalleryItem";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { images } = await req.json();

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "Images array is required" }, { status: 400 });
  }

  await connectDB();

  const galleryDocs = images.map((url: string) => ({
    imageUrl: url,
    type: "INSPIRATION",
    isApproved: true,
  }));

  const createdItems = await GalleryItem.insertMany(galleryDocs);

  return NextResponse.json({ success: true, count: createdItems.length }, { status: 201 });
}
