import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  /** Set for catalogue products. */
  productId?: string;
  /** Set for accepted custom / made-to-order requests. */
  requestId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

/**
 * Stable identity for a line item. A quoted request and a catalogue product can
 * share an id space, so the kind is part of the key.
 */
export function cartItemKey(
  item: Pick<CartItem, "productId" | "requestId">
): string {
  return item.requestId ? `request:${item.requestId}` : `product:${item.productId}`;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
}

const calcTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((s, i) => s + i.quantity, 0),
  totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
});

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item);
          const existing = state.items.find((i) => cartItemKey(i) === key);

          // A quoted request is a single one-off; don't stack duplicates.
          const items = existing
            ? state.items.map((i) =>
                cartItemKey(i) === key
                  ? {
                      ...i,
                      quantity: item.requestId
                        ? 1
                        : i.quantity + item.quantity,
                    }
                  : i
              )
            : [...state.items, item];

          return { items, ...calcTotals(items) };
        }),

      removeItem: (key) =>
        set((state) => {
          const items = state.items.filter((i) => cartItemKey(i) !== key);
          return { items, ...calcTotals(items) };
        }),

      updateQuantity: (key, quantity) =>
        set((state) => {
          const items = state.items.map((i) =>
            cartItemKey(i) === key ? { ...i, quantity } : i
          );
          return { items, ...calcTotals(items) };
        }),

      clearCart: () =>
        set({ items: [], totalItems: 0, totalAmount: 0 }),
    }),
    { name: "boutique-cart" }
  )
);
