export default function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10 space-y-3">
        <div className="h-9 w-52 mx-auto rounded bg-background-secondary animate-pulse" />
        <div className="h-4 w-64 mx-auto rounded bg-background-secondary animate-pulse" />
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-background-secondary animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
