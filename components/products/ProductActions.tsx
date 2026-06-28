"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  inventoryMode: "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";
  isCustomizable: boolean;
  stock: number;
}

export default function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function handleAddToCart() {
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      quantity,
    });
    toast.success("Added to cart!");
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <div className="space-y-4">
      {product.inventoryMode === "READY_STOCK" && (
        <>
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-muted">Qty:</span>
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-foreground-muted hover:text-foreground"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1 text-foreground-muted hover:text-foreground"
              >
                +
              </button>
            </div>
            <span className="text-xs text-foreground-muted">
              {product.stock} available
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-primary text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Buy Now
            </button>
          </div>
        </>
      )}

      {product.inventoryMode === "MADE_TO_ORDER" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700">
            This item is made to order. Submit a request and we'll confirm
            availability and price.
          </div>
          <Link
            href={`/requests/new?productId=${product._id}&type=MADE_TO_ORDER`}
            className="block w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium text-center hover:opacity-90 transition-opacity"
          >
            Request Availability
          </Link>
        </div>
      )}

      {product.inventoryMode === "CUSTOM_ONLY" && (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm text-purple-700">
            This is a fully custom product. Share your requirements and we'll
            craft something unique for you.
          </div>
          <Link
            href={`/custom-orders?productId=${product._id}`}
            className="block w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium text-center hover:opacity-90 transition-opacity"
          >
            Request Custom Order
          </Link>
        </div>
      )}

      {product.isCustomizable && product.inventoryMode === "READY_STOCK" && (
        <Link
          href={`/custom-orders?productId=${product._id}`}
          className="block w-full border border-border text-foreground-muted py-2.5 rounded-md text-sm font-medium text-center hover:border-primary hover:text-primary transition-colors"
        >
          ✦ Customize Similar
        </Link>
      )}
    </div>
  );
}
