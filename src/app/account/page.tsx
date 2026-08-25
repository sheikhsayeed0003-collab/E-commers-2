"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/useShop";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/catalog";
import { logoutClient } from "@/lib/authClient";

export default function AccountPage() {
  const { user, currency, authReady } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [chat, setChat] = useState(false);
  const [returnId, setReturnId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, [authReady, user, router]);

  if (!authReady || !user) return <p className="p-16 text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted">Client</p>
          <h1 className="mt-2 text-4xl font-light">{user.name}</h1>
        </div>
        <button
          type="button"
          className="text-xs tracking-[0.16em] uppercase underline underline-offset-4"
          onClick={async () => {
            await logoutClient();
            router.push("/");
            router.refresh();
          }}
        >
          Logout
        </button>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["Total points", user.loyaltyPoints],
          ["Pending points", user.pendingPoints],
          ["Tier", user.tier],
        ].map(([k, v]) => (
          <div key={String(k)} className="border border-line p-5">
            <p className="text-xs tracking-[0.2em] uppercase text-muted">{k}</p>
            <p className="mt-2 text-2xl font-light">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-xl font-light">Order history</h2>
      <div className="mt-4 divide-y border-y border-line">
        {orders.length === 0 && <p className="py-6 text-sm text-muted">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
            <div>
              <p>{o.id}</p>
              <p className="text-muted">
                {o.paymentStatus} · {o.deliveryStatus}
              </p>
            </div>
            <p>{formatMoney(o.totalUsd, currency)}</p>
            <button type="button" className="underline" onClick={() => setReturnId(o.id)}>
              Request return
            </button>
          </div>
        ))}
      </div>
      {returnId && (
        <p className="mt-4 text-sm">Return requested for {returnId}. Client care will reply within 24 hours.</p>
      )}

      <button type="button" onClick={() => setChat(true)} className="mt-10 border border-ink px-6 py-3 text-xs tracking-[0.2em]">
        CHAT WITH US
      </button>
      {chat && (
        <div className="mt-4 border border-line p-5 text-sm">
          <p>Maison concierge is online.</p>
          <p className="mt-2 text-muted">How can we help with sizing, raffles, or an existing order?</p>
        </div>
      )}
    </div>
  );
}
