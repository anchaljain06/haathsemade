import { useQuery } from "@tanstack/react-query";

async function fetchProduct(slugOrId: string) {
  const res = await fetch(`/api/products/${slugOrId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: ["product", slugOrId],
    queryFn: () => fetchProduct(slugOrId),
    enabled: !!slugOrId,
  });
}