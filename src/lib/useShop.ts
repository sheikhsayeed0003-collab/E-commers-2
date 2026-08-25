import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Currency, SessionUser } from "./types";

type State = {
  currency: Currency;
  cartOpen: boolean;
  cart: CartItem[];
  user: SessionUser | null;
  authReady: boolean;
  setCurrency: (c: Currency) => void;
  setCartOpen: (open: boolean) => void;
  setUser: (u: SessionUser | null) => void;
  setAuthReady: (ready: boolean) => void;
  setCart: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
};

export const useShop = create<State>()(
  persist(
    (set, get) => ({
      currency: "USD",
      cartOpen: false,
      cart: [],
      user: null,
      authReady: false,
      setCurrency: (currency) => set({ currency }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setUser: (user) => set({ user }),
      setAuthReady: (authReady) => set({ authReady }),
      setCart: (cart) => set({ cart }),
      addItem: (item) => {
        const cart = [...get().cart];
        const i = cart.findIndex(
          (c) => c.productId === item.productId && c.size === item.size && c.color === item.color
        );
        if (i >= 0) cart[i] = { ...cart[i], qty: cart[i].qty + item.qty };
        else cart.push(item);
        set({ cart, cartOpen: true });
      },
      updateQty: (productId, size, color, qty) => {
        set({
          cart: get()
            .cart.map((c) =>
              c.productId === productId && c.size === size && c.color === color ? { ...c, qty } : c
            )
            .filter((c) => c.qty > 0),
        });
      },
      removeItem: (productId, size, color) =>
        set({
          cart: get().cart.filter(
            (c) => !(c.productId === productId && c.size === size && c.color === color)
          ),
        }),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "maison-shop",
      partialize: (s) => ({ currency: s.currency, cart: s.cart }),
    }
  )
);
