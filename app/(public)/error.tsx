"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="font-heading text-3xl text-foreground mb-3">
        Something went wrong
      </h1>
      <p className="text-foreground-muted mb-8">
        We couldn&apos;t load this page. It&apos;s us, not you — please try again.
      </p>

      <button
        onClick={reset}
        className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>

      {error.digest && (
        <p className="text-xs text-foreground-muted mt-8">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
