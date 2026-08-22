import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-background-secondary py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="h-3 w-40 mx-auto rounded bg-border animate-pulse" />
          <div className="h-14 w-full rounded bg-border animate-pulse" />
          <div className="h-4 w-2/3 mx-auto rounded bg-border animate-pulse" />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 mx-auto rounded bg-background-secondary animate-pulse mb-8" />
          <ProductGridSkeleton
            count={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          />
        </div>
      </section>
    </div>
  );
}
