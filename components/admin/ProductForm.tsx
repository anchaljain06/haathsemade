"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUpload from "@/components/shared/ImageUpload";
import { productSchema } from "@/schemas/zodValidations";

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  _id?: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  categoryId: string;
  inventoryMode: "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";
  isCustomizable: boolean;
  estimatedCraftTime: string;
  stock: number;
  isPublished: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  images: [],
  price: 0,
  categoryId: "",
  inventoryMode: "READY_STOCK",
  isCustomizable: false,
  estimatedCraftTime: "",
  stock: 0,
  isPublished: false,
};

export default function ProductForm({
  categories,
  initialData,
}: {
  categories: Category[];
  initialData?: ProductFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initialData?._id;

  function update<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(publish: boolean) {
    const result = productSchema.safeParse({ ...form, isPublished: publish });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (!form.name || !form.categoryId || form.price <= 0) {
      toast.error("Please fill in name, category, and a valid price");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, isPublished: publish };
      const url = isEdit
        ? `/api/admin/products/${form._id}`
        : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");

      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Product Name *
        </label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Images
        </label>
        <ImageUpload
          value={form.images}
          onChange={(urls) => update("images", urls)}
          maxFiles={6}
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price (₹) *
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Stock
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", Number(e.target.value))}
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Category *
        </label>
        <select
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Mode */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Inventory Mode *
        </label>
        <div className="space-y-2">
          {[
            { value: "READY_STOCK", label: "Ready Stock — available now" },
            { value: "MADE_TO_ORDER", label: "Made to Order — request availability" },
            { value: "CUSTOM_ONLY", label: "Custom Only — fully personalized" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.inventoryMode === opt.value}
                onChange={() => update("inventoryMode", opt.value as any)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground-muted">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Craft Time */}
      {form.inventoryMode !== "READY_STOCK" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Estimated Craft Time
          </label>
          <input
            value={form.estimatedCraftTime}
            onChange={(e) => update("estimatedCraftTime", e.target.value)}
            placeholder="e.g. 4-5 days"
            className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Customizable toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isCustomizable}
          onChange={(e) => update("isCustomizable", e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm text-foreground-muted">
          This product can be customized (shows "Customize Similar" button)
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="border border-border text-foreground-muted px-5 py-2.5 rounded-md text-sm font-medium hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
