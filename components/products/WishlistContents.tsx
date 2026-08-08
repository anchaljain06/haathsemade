"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useHydrated } from "@/hooks/useHydrated";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function WishlistContents() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useHydrated();

  // The list lives in localStorage, so there's nothing to show until hydration.
  if (!hydrated) {
    return (
      <>
        <div className="h-9 w-48 rounded bg-background-secondary animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-background-secondary flex items-center justify-center">
          <Heart className="w-6 h-6 text-foreground-muted" />
        </div>
        <h1 className="font-heading text-3xl text-foreground mb-3">
          Nothing saved yet
        </h1>
        <p className="text-foreground-muted mb-8 max-w-sm mx-auto">
          Tap the heart on any piece you love and it will wait for you here.
        </p>
        <Link
          href="/products"
          className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-foreground mb-1">
            Your Wishlist
          </h1>
          <p className="text-foreground-muted text-sm">
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved on
            this device
          </p>
        </div>
        <button
          onClick={() => {
            clear();
            toast.success("Wishlist cleared");
          }}
          className="text-sm text-foreground-muted hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-card border border-border rounded-lg overflow-hidden group"
          >
            <Link
              href={`/products/${item.slug ?? item.productId}`}
              className="block relative aspect-square bg-background-secondary overflow-hidden"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground-muted text-xs">
                  No Image
                </div>
              )}
            </Link>

            <div className="p-3">
              <Link href={`/products/${item.slug ?? item.productId}`}>
                <h2 className="font-heading text-sm text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
                  {item.name}
                </h2>
              </Link>
              <p className="text-primary font-medium text-sm mb-3">
                ₹{item.price.toLocaleString()}
              </p>

              <div className="flex items-center gap-2">
                {item.inventoryMode === "READY_STOCK" ? (
                  <button
                    onClick={() => {
                      addItem({
                        productId: item.productId,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: 1,
                      });
                      toast.success(`${item.name} added to cart`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-1.5 rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to cart
                  </button>
                ) : (
                  <Link
                    href={`/products/${item.slug ?? item.productId}`}
                    className="flex-1 text-center border border-primary text-primary py-1.5 rounded-md text-xs font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    Request it
                  </Link>
                )}

                <button
                  onClick={() => {
                    remove(item.productId);
                    toast.success("Removed from wishlist");
                  }}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="p-1.5 text-foreground-muted hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
