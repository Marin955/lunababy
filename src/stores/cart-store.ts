import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  isHydrated: boolean;
  addItem: (bundleId: string) => void;
  removeItem: (bundleId: string) => void;
  updateQuantity: (bundleId: string, quantity: number) => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
  clearCart: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        promoCode: null,
        isHydrated: false,

        addItem: (bundleId: string) =>
          set(
            (state) => {
              const existing = state.items.find(
                (item) => item.bundleId === bundleId
              );
              if (existing) {
                return {
                  items: state.items.map((item) =>
                    item.bundleId === bundleId
                      ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
                      : item
                  ),
                };
              }
              return {
                items: [...state.items, { bundleId, quantity: 1 }],
              };
            },
            false,
            'addItem'
          ),

        removeItem: (bundleId: string) =>
          set(
            (state) => ({
              items: state.items.filter((item) => item.bundleId !== bundleId),
            }),
            false,
            'removeItem'
          ),

        updateQuantity: (bundleId: string, quantity: number) =>
          set(
            (state) => {
              const clamped = Math.max(0, Math.min(10, quantity));
              if (clamped === 0) {
                return {
                  items: state.items.filter(
                    (item) => item.bundleId !== bundleId
                  ),
                };
              }
              return {
                items: state.items.map((item) =>
                  item.bundleId === bundleId
                    ? { ...item, quantity: clamped }
                    : item
                ),
              };
            },
            false,
            'updateQuantity'
          ),

        applyPromo: (code: string) =>
          set({ promoCode: code }, false, 'applyPromo'),

        removePromo: () =>
          set({ promoCode: null }, false, 'removePromo'),

        clearCart: () =>
          set({ items: [], promoCode: null }, false, 'clearCart'),

        setHydrated: (hydrated: boolean) =>
          set({ isHydrated: hydrated }, false, 'setHydrated'),
      }),
      {
        name: 'lunababy-cart',
        version: 1,
        partialize: (state) => ({
          items: state.items,
          promoCode: state.promoCode,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            state?.setHydrated(true);
          };
        },
      }
    ),
    { name: 'CartStore' }
  )
);
