"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  currentCategory?: string;
  currentMode?: string;
  currentSort?: string;
}

const modes = [
  { value: "READY_STOCK", label: "In Stock" },
  { value: "MADE_TO_ORDER", label: "Made to Order" },
  { value: "CUSTOM_ONLY", label: "Custom Only" },
];

const sorts = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductFilters({
  categories,
  currentCategory,
  currentMode,
  currentSort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Sort By</h3>
        <div className="space-y-2">
          {sorts.map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={currentSort === s.value || (!currentSort && s.value === "")}
                onChange={() => updateFilter("sort", s.value)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground-muted">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!currentCategory}
              onChange={() => updateFilter("category", "")}
              className="accent-primary"
            />
            <span className="text-sm text-foreground-muted">All</span>
          </label>
          {categories.map((c) => (
            <label key={c._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={currentCategory === c.slug}
                onChange={() => updateFilter("category", c.slug)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground-muted">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Availability
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={!currentMode}
              onChange={() => updateFilter("mode", "")}
              className="accent-primary"
            />
            <span className="text-sm text-foreground-muted">All</span>
          </label>
          {modes.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={currentMode === m.value}
                onChange={() => updateFilter("mode", m.value)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground-muted">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={() => router.push("/products")}
        className="text-xs text-primary hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
