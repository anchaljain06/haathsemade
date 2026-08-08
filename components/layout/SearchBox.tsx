"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Deliberately does not read useSearchParams(): this renders inside the global
 * Navbar, and that hook forces every otherwise-static page (/about, /privacy)
 * into a Suspense boundary at build time. Callers that know the current query
 * can seed it via defaultValue.
 */
export default function SearchBox({
  defaultValue = "",
  className = "",
}: {
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search handmade pieces..."
        aria-label="Search products"
        className="w-full bg-background-secondary border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors"
      />
    </form>
  );
}
