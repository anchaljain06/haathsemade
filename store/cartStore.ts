import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          const items = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item];
          return { items, ...calcTotals(items) };
        }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, ...calcTotals(items) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
          return { items, ...calcTotals(items) };
        }),

      clearCart: () =>
        set({ items: [], totalItems: 0, totalAmount: 0 }),
    }),
    { name: "boutique-cart" }
  )
);