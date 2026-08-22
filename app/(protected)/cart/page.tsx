"use client";

import { useCartStore, cartItemKey } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, totalAmount, removeItem, updateQuantity } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl text-foreground mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-foreground-muted mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/products"
          className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-foreground mb-8">
        Your Cart
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={cartItemKey(item)}
              className="flex gap-4 bg-card border border-border rounded-lg p-4"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-md bg-background-secondary overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="flex-1">
                <h3 className="font-heading text-sm text-foreground mb-1">
                  {item.name}
                </h3>
                <p className="text-primary font-medium text-sm mb-3">
                  ₹{item.price.toLocaleString()}
                </p>

                <div className="flex items-center gap-3">
                  {item.requestId ? (
                    // A quoted custom piece is a one-off — no quantity to change.
                    <span className="text-xs text-foreground-muted bg-background-secondary rounded-md px-2.5 py-1">
                      Custom piece · qty 1
                    </span>
                  ) : (
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItemKey(item),
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-foreground-muted hover:text-foreground"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(cartItemKey(item), item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-foreground-muted hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(cartItemKey(item))}
                    aria-label={`Remove ${item.name}`}
                    className="text-destructive hover:opacity-70"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-foreground text-sm">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-background-secondary rounded-lg p-6 h-fit">
          <h2 className="font-heading text-lg text-foreground mb-4">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm text-foreground-muted mb-2">
            <span>Subtotal</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <p className="text-xs text-foreground-muted mb-4">
            Shipping calculated at checkout
          </p>
          <div className="border-t border-border pt-4 flex justify-between font-medium text-foreground mb-6">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-primary text-white text-center py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block text-center text-sm text-primary mt-3 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
