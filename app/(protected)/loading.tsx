export default function ProtectedLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="h-9 w-48 rounded bg-background-secondary animate-pulse mb-8" />

      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
