export default function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="aspect-square bg-background-secondary animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-background-secondary animate-pulse" />
        <div className="h-3 w-full rounded bg-background-secondary animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-background-secondary animate-pulse" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3.5 w-14 rounded bg-background-secondary animate-pulse" />
          <div className="h-6 w-6 rounded-md bg-background-secondary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  className = "grid grid-cols-2 md:grid-cols-3 gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
