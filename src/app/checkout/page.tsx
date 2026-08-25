"use client";

import { useState } from "react";
import { useShop } from "@/lib/useShop";
import { formatMoney } from "@/lib/catalog";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, currency, clearCart, setCartOpen } = useShop();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    line1: "",
    city: "",
    country: "BD",
    postal: "",
    card: "4242 4242 4242 4242",
  });
  const total = cart.reduce((s, i) => s + i.priceUsd * i.qty, 0);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setCartOpen(false);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, currency, shipping: form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || data.error) {
      alert(data.error || "Payment failed");
      return;
    }
    if (data.order) {
      clearCart();
      router.push(`/checkout/success?id=${data.order.id}`);
    }
  }

  if (!cart.length) {
    return <p className="p-16 text-center text-sm">Your bag is empty.</p>;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-2">
      <form onSubmit={pay} className="space-y-4">
        <h1 className="text-3xl font-light">Checkout</h1>
        <p className="text-sm text-muted">
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
            ? "Stripe test mode connected — payments create real PaymentIntents."
            : "Add Stripe keys in .env.local for live PaymentIntents (demo mode works without them)."}
        </p>
        {(["name", "line1", "city", "postal"] as const).map((k) => (
          <input
            key={k}
            required
            placeholder={k}
            className="w-full border border-line bg-transparent px-3 py-3"
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
        <input
          required
          placeholder="Card number"
          className="w-full border border-line bg-transparent px-3 py-3"
          value={form.card}
          onChange={(e) => setForm({ ...form, card: e.target.value })}
        />
        <button disabled={loading} className="w-full bg-ink py-4 text-xs tracking-[0.3em] text-white">
          {loading ? "PROCESSING" : `PAY ${formatMoney(total, currency)}`}
        </button>
      </form>
      <div>
        {cart.map((i) => (
          <div key={`${i.productId}${i.size}${i.color}`} className="mb-4 flex justify-between text-sm">
            <span>
              {i.name} × {i.qty}
            </span>
            <span>{formatMoney(i.priceUsd * i.qty, currency)}</span>
          </div>
        ))}
        <div className="mt-6 flex justify-between border-t border-line pt-4">
          <span>Total</span>
          <span>{formatMoney(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
