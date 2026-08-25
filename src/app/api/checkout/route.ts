import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, nextId, saveState, tierFromPoints } from "@/lib/store";
import type { CartItem } from "@/lib/types";

export async function POST(req: Request) {
  const session = await getSession();
  const body = await req.json();
  const items: CartItem[] = body.items || [];
  const shipping = body.shipping;
  const currency = body.currency || "USD";
  if (!items.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });

  const totalUsd = items.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const order = {
    id: nextId("ord"),
    userId: session?.id || "guest",
    items,
    totalUsd,
    currency,
    stripePaymentId: body.paymentIntentId || `demo_${Date.now()}`,
    paymentStatus: "pending" as const,
    deliveryStatus: "processing" as const,
    shipping,
    createdAt: new Date().toISOString(),
  };
  db.orders().push(order);

  if (session) {
    const user = db.users().find((u) => u.id === session.id);
    if (user) {
      user.pendingPoints += Math.round(totalUsd);
      user.tier = tierFromPoints(user.loyaltyPoints);
    }
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (secret && secret.startsWith("sk_")) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalUsd * 100),
      currency: "usd",
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    });
    order.stripePaymentId = intent.id;
    saveState();
    return NextResponse.json({ order, clientSecret: intent.client_secret });
  }

  order.paymentStatus = "paid";
  if (session) {
    const user = db.users().find((u) => u.id === session.id);
    if (user) {
      user.loyaltyPoints += Math.round(totalUsd);
      user.pendingPoints = Math.max(0, user.pendingPoints - Math.round(totalUsd));
      user.tier = tierFromPoints(user.loyaltyPoints);
    }
  }
  saveState();
  return NextResponse.json({ order, demo: true });
}
