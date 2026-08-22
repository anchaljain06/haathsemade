"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Collapses long page lists to a window around the current page
 * (1 … 4 5 6 … 12) and preserves existing filters in the query string.
 */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);

  const sorted = [...pages].sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export default function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(n: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (n === 1) next.delete("page");
    else next.set("page", String(n));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center gap-2 mt-10"
    >
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className="px-3 h-8 flex items-center rounded-md text-sm border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors"
        >
          Prev
        </Link>
      )}

      {pageWindow(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span
            key={`gap-${i}`}
            className="w-8 h-8 flex items-center justify-center text-sm text-foreground-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm border transition-colors ${
              n === page
                ? "bg-primary text-white border-primary"
                : "border-border text-foreground-muted hover:border-primary hover:text-primary"
            }`}
          >
            {n}
          </Link>
        )
      )}

      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className="px-3 h-8 flex items-center rounded-md text-sm border border-border text-foreground-muted hover:border-primary hover:text-primary transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
