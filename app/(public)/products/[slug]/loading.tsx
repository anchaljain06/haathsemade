export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg bg-background-secondary animate-pulse" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-md bg-background-secondary animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="h-3 w-24 rounded bg-background-secondary animate-pulse" />
          <div className="h-10 w-3/4 rounded bg-background-secondary animate-pulse" />
          <div className="h-8 w-32 rounded bg-background-secondary animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-background-secondary animate-pulse" />
            <div className="h-3 w-full rounded bg-background-secondary animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-background-secondary animate-pulse" />
          </div>
          <div className="h-12 w-full rounded-md bg-background-secondary animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}
