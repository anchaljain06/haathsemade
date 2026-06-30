"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  inventoryMode: string;
  isPublished: boolean;
  categoryId?: { name: string };
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || p.categoryId?.name === categoryFilter;
    const matchesMode = !modeFilter || p.inventoryMode === modeFilter;
    return matchesSearch && matchesCategory && matchesMode;
  });

  async function togglePublish(id: string, current: boolean) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      toast.success(current ? "Unpublished" : "Published");
      router.refresh();
    } else {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Product deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Modes</option>
          <option value="READY_STOCK">Ready Stock</option>
          <option value="MADE_TO_ORDER">Made to Order</option>
          <option value="CUSTOM_ONLY">Custom Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-foreground-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Mode</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-background-secondary">
                    {p.images[0] && (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {p.categoryId?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-foreground-muted text-xs">
                  {p.inventoryMode}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  ₹{p.price.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{p.stock}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublish(p._id, p.isPublished)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${p._id}/edit`}
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
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
        {filtered.length === 0 && (
          <p className="text-center text-foreground-muted text-sm py-8">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}
