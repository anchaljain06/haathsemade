import Link from "next/link";

/**
 * The auth middleware runs on every page route and normalizes the response
 * status, so notFound() can render this page with a 200 instead of a 404 —
 * paths excluded from the middleware matcher do return a real 404. Until that
 * changes, noindex keeps search engines from indexing soft 404s.
 *
 * Was originally observed under clerkMiddleware(); the Auth.js middleware wraps
 * responses the same way, so the guard stays.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
          404
        </p>
        <h1 className="font-heading text-4xl text-foreground mb-4">
          We couldn&apos;t find that
        </h1>
        <p className="text-foreground-muted mb-8">
          The page or piece you&apos;re looking for may have been moved, or sold
          out and retired from the shelf.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse products
          </Link>
          <Link
            href="/"
            className="border border-border text-foreground-muted px-6 py-2.5 rounded-md text-sm font-medium hover:border-primary hover:text-primary transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
