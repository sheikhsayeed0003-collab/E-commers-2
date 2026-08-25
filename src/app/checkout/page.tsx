"use client";

import { FormEvent, useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/catalog";
import { useShop } from "@/lib/useShop";

type Shipping = {
  name: string;
  line1: string;
  city: string;
  country: string;
  postal: string;
};

function PaymentForm({
  orderId,
  totalLabel,
  onBack,
}: {
  orderId: string;
  totalLabel: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart, setCartOpen } = useShop();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    setCartOpen(false);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?id=${orderId}`,
      },
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      setBusy(false);
      return;
    }

    const intent = result.paymentIntent;
    if (intent?.status === "succeeded") {
      await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentIntentId: intent.id }),
      });
      clearCart();
      router.push(`/checkout/success?id=${orderId}`);
      return;
    }

    setError("Payment was not completed. Please try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="w-full bg-ink py-4 text-xs tracking-[0.3em] text-white disabled:opacity-50"
      >
        {busy ? "PROCESSING…" : `PAY ${totalLabel}`}
      </button>
      <button type="button" onClick={onBack} className="w-full border border-line py-3 text-xs tracking-[0.2em]">
        BACK
      </button>
      <p className="text-xs text-muted">Test card: 4242 4242 4242 4242 · any future expiry · any CVC</p>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, currency, clearCart, setCartOpen } = useShop();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Shipping>({
    name: "",
    line1: "",
    city: "",
    country: "BD",
    postal: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = cart.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const totalLabel = formatMoney(total, currency);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey) as Promise<Stripe | null>;
  }, [publishableKey]);

  async function startPayment(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, currency, shipping: form }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok || data.error) {
      setError(data.error || "Could not start checkout");
      return;
    }

    if (data.demo && data.order) {
      setCartOpen(false);
      clearCart();
      router.push(`/checkout/success?id=${data.order.id}`);
      return;
    }

    if (data.clientSecret && data.publishableKey && data.order) {
      setClientSecret(data.clientSecret);
      setPublishableKey(data.publishableKey);
      setOrderId(data.order.id);
      return;
    }

    setError("Stripe keys missing — check .env.local");
  }

  if (!cart.length && !clientSecret) {
    return <p className="p-16 text-center text-sm">Your bag is empty.</p>;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-light">Checkout</h1>
        <p className="text-sm text-muted">
          Pay securely with Stripe. Use test card <span className="text-ink">4242 4242 4242 4242</span>.
        </p>

        {!clientSecret ? (
          <form onSubmit={startPayment} className="space-y-4">
            {(
              [
                ["name", "Full name"],
                ["line1", "Address"],
                ["city", "City"],
                ["postal", "Postal code"],
              ] as const
            ).map(([k, label]) => (
              <input
                key={k}
                required
                placeholder={label}
                className="w-full border border-line bg-transparent px-3 py-3"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            ))}
            <input
              required
              placeholder="Country"
              className="w-full border border-line bg-transparent px-3 py-3"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button disabled={loading} className="w-full bg-ink py-4 text-xs tracking-[0.3em] text-white">
              {loading ? "PREPARING…" : `CONTINUE TO PAYMENT · ${totalLabel}`}
            </button>
          </form>
        ) : stripePromise && orderId ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe", variables: { colorPrimary: "#111111" } },
            }}
          >
            <PaymentForm
              orderId={orderId}
              totalLabel={totalLabel}
              onBack={() => {
                setClientSecret(null);
                setPublishableKey(null);
                setOrderId(null);
              }}
            />
          </Elements>
        ) : null}
      </div>

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
          <span>{totalLabel}</span>
        </div>
      </div>
    </div>
  );
}
