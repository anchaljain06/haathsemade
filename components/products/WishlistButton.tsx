"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  useWishlistStore,
  selectIsSaved,
  type WishlistItem,
} from "@/store/wishlistStore";
import { useHydrated } from "@/hooks/useHydrated";

/**
 * `icon` is the small overlay heart on a product card; `full` is the labelled
 * button on the product detail page.
 */
export default function WishlistButton({
  item,
  variant = "icon",
}: {
  item: WishlistItem;
  variant?: "icon" | "full";
}) {
  const toggle = useWishlistStore((s) => s.toggle);
  const saved = useWishlistStore(selectIsSaved(item.productId));
  const hydrated = useHydrated();

  // Before hydration the persisted list is unknown, so render the unsaved state
  // on both server and client and let it settle after mount.
  const isSaved = hydrated && saved;

  function handleClick(e: React.MouseEvent) {
    // Cards wrap this in a <Link> — don't navigate.
    e.preventDefault();
    e.stopPropagation();

    toggle(item);
    toast.success(isSaved ? "Removed from wishlist" : "Saved to wishlist");
  }

  const label = isSaved ? "Remove from wishlist" : "Save to wishlist";

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        aria-label={label}
        aria-pressed={isSaved}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md border text-sm font-medium transition-colors ${
          isSaved
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-foreground-muted hover:border-primary hover:text-primary"
        }`}
      >
        <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        {isSaved ? "Saved to wishlist" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isSaved}
      className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
        isSaved
          ? "bg-white text-primary"
          : "bg-white/80 text-foreground-muted hover:text-primary"
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
