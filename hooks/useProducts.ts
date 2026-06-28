import { useQuery } from "@tanstack/react-query";

interface ProductFilters {
  category?: string;
  mode?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

async function fetchProducts(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });
}