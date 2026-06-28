import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  closeAll: () => set({ isMobileMenuOpen: false, isCartOpen: false }),
}));