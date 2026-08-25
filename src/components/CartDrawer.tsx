"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useShop } from "@/lib/useShop";
import { formatMoney } from "@/lib/catalog";
import { SafeImg } from "@/components/SafeImg";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, updateQty, removeItem, currency } = useShop();
  const total = cart.reduce((s, i) => s + i.priceUsd * i.qty, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        aria-hidden={!cartOpen}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-paper shadow-2xl transition-transform duration-500 ${
          cartOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="tracking-[0.25em] text-sm">BAG</p>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag">
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-180px)] overflow-y-auto px-6 py-6">
          {cart.length === 0 && <p className="text-sm text-muted">Your bag is empty.</p>}
          {cart.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="mb-6 flex gap-4">
              <SafeImg src={item.image} alt="" className="h-28 w-24 shrink-0 object-cover" />
              <div className="flex-1 text-sm">
                <p>{item.name}</p>
                <p className="text-muted">
                  {item.color} / {item.size}
                </p>
                <p className="mt-1">{formatMoney(item.priceUsd, currency)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)}>
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)}>
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs underline"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 w-full border-t border-line bg-paper px-6 py-5">
          <div className="mb-3 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setCartOpen(false)}
            className="block bg-ink py-3 text-center text-xs tracking-[0.25em] text-white"
          >
            CHECKOUT
          </Link>
        </div>
      </aside>
    </>
  );
}
