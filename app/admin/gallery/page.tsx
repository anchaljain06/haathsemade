import { connectDB } from "@/lib/db";
import GalleryItem from "@/models/GalleryItem";
import GalleryManager from "@/components/admin/GalleryManager";

async function getGalleryItems() {
  await connectDB();
  return GalleryItem.find().sort({ createdAt: -1 }).lean();
}

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <div>
      <h1 className="font-heading text-3xl text-foreground mb-6">Gallery</h1>
      <GalleryManager initialItems={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
