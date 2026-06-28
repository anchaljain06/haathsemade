"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Paintbrush } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  inventoryMode: "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";
  isCustomizable: boolean;
  estimatedCraftTime: string;
  stock: number;
}

const modeBadge = {
  READY_STOCK: { label: "In Stock", className: "bg-green-100 text-green-700 border-0" },
  MADE_TO_ORDER: { label: "Made to Order", className: "bg-amber-100 text-amber-700 border-0" },
  CUSTOM_ONLY: { label: "Custom Only", className: "bg-purple-100 text-purple-700 border-0" },
};

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const badge = modeBadge[product.inventoryMode];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <Link
      href={`/products/${product._id}`}
      className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-hover transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-background-secondary overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-muted text-xs">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-heading text-sm text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-foreground-muted text-xs line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-primary font-medium text-sm">
            ₹{product.price.toLocaleString()}
          </span>

          {product.inventoryMode === "READY_STOCK" && (
            <button
              onClick={handleAddToCart}
              className="p-1.5 rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
          {product.inventoryMode === "MADE_TO_ORDER" && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Clock className="w-3 h-3" />
              {product.estimatedCraftTime}
            </span>
          )}
          {product.inventoryMode === "CUSTOM_ONLY" && (
            <span className="flex items-center gap-1 text-xs text-purple-600">
              <Paintbrush className="w-3 h-3" />
              Custom
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
