"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/shared/ImageUpload";
import { Trash2, Check } from "lucide-react";

interface GalleryItemData {
  _id: string;
  image: string;
  title?: string;
  type: "INSPIRATION" | "CUSTOMER_MEMORY";
  isApproved: boolean;
}

export default function GalleryManager({
  initialItems,
}: {
  initialItems: GalleryItemData[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<"INSPIRATION" | "CUSTOMER_MEMORY">(
    "INSPIRATION"
  );
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const filtered = items.filter((i) => i.type === tab);

  async function handleUpload() {
    if (newImages.length === 0) return;
    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: newImages,
          type: tab,
        }),
      });
      const data = await res.json();
      setItems((prev) => [...data.items, ...prev]);
      setNewImages([]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function toggleApprove(item: GalleryItemData) {
    const res = await fetch(`/api/admin/gallery/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !item.isApproved }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, isApproved: !i.isApproved } : i
        )
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Deleted");
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("INSPIRATION")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "INSPIRATION"
              ? "bg-primary text-white"
              : "border border-border text-foreground-muted"
          }`}
        >
          Inspirations
        </button>
        <button
          onClick={() => setTab("CUSTOMER_MEMORY")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "CUSTOMER_MEMORY"
              ? "bg-primary text-white"
              : "border border-border text-foreground-muted"
          }`}
        >
          Customer Memories
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-md">
        <h3 className="font-heading text-base text-foreground mb-3">
          Upload New {tab === "INSPIRATION" ? "Inspiration" : "Customer Memory"}
        </h3>
        <ImageUpload value={newImages} onChange={setNewImages} maxFiles={10} />
        {newImages.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-3 bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Saving..." : `Save ${newImages.length} image(s)`}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="relative aspect-square rounded-lg overflow-hidden border border-border group"
          >
            <Image src={item.image} alt={item.title ?? "Gallery image"} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => toggleApprove(item)}
                className={`p-2 rounded-full ${
                  item.isApproved ? "bg-green-500" : "bg-white"
                }`}
              >
                <Check
                  className={`w-4 h-4 ${
                    item.isApproved ? "text-white" : "text-foreground"
                  }`}
                />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-2 rounded-full bg-white"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
            {!item.isApproved && (
              <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground-muted text-sm py-8">
          No items here yet
        </p>
      )}
    </div>
  );
}
