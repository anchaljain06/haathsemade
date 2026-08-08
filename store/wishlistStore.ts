import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A saved product. Denormalized on purpose: the wishlist page renders straight
 * from localStorage with no round trip, so a signed-out visitor can save pieces
 * while browsing. Price is a snapshot for display — anything that charges money
 * re-reads the catalogue server-side.
 */
export interface WishlistItem {
  productId: string;
  slug?: string;
  name: string;
  image: string;
  price: number;
  inventoryMode: "READY_STOCK" | "MADE_TO_ORDER" | "CUSTOM_ONLY";
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.productId === item.productId
          );
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [item, ...state.items],
          };
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "hathsemade-wishlist" }
  )
);

/** Selector helper — keeps components from re-rendering on unrelated changes. */
export const selectIsSaved = (productId: string) => (state: WishlistStore) =>
  state.items.some((i) => i.productId === productId);
