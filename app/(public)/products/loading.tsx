import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-56 rounded bg-background-secondary animate-pulse" />
        <div className="h-4 w-28 rounded bg-background-secondary animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-4 w-full rounded bg-background-secondary animate-pulse"
            />
          ))}
        </aside>

        <div className="flex-1">
          <ProductGridSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}
