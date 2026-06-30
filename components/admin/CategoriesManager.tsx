"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/shared/ImageUpload";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setImage(cat.image ? [cat.image] : []);
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setName("");
    setImage([]);
    setShowForm(true);
  }

  async function handleSave() {
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { name, image: image[0] ?? "" };
      const url = editing
        ? `/api/admin/categories/${editing._id}`
        : "/api/admin/categories";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      toast.success(editing ? "Category updated" : "Category created");
      setShowForm(false);
      router.refresh();
      const data = await res.json();
      if (editing) {
        setCategories((cats) =>
          cats.map((c) => (c._id === editing._id ? data.category : c))
        );
      } else {
        setCategories((cats) => [data.category, ...cats]);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    const res = await fetch(`/api/admin/categories/${cat._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    if (res.ok) {
      setCategories((cats) =>
        cats.map((c) =>
          c._id === cat._id ? { ...c, isActive: !c.isActive } : c
        )
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCategories((cats) => cats.filter((c) => c._id !== id));
      toast.success("Category deleted");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={startNew}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-md">
          <h3 className="font-heading text-lg text-foreground mb-4">
            {editing ? "Edit Category" : "New Category"}
          </h3>
          <div className="space-y-4">
            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm"
            />
            <ImageUpload value={image} onChange={setImage} maxFiles={1} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-foreground-muted text-sm px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-foreground-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-background-secondary">
                    {c.image && (
                      <Image src={c.image} alt={c.name} fill className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {c.name}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{c.slug}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-destructive text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="text-center text-foreground-muted text-sm py-8">
            No categories yet
          </p>
        )}
      </div>
    </div>
  );
}
