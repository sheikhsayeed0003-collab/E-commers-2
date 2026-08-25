import { NextResponse } from "next/server";
import { db, tierFromPoints } from "@/lib/store";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();
  if (secret) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    const sig = req.headers.get("stripe-signature") || "";
    try {
      const event = stripe.webhooks.constructEvent(body, sig, secret);
      if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object as { id: string; metadata?: { orderId?: string } };
        const order = db.orders().find((o) => o.id === pi.metadata?.orderId || o.stripePaymentId === pi.id);
        if (order) {
          order.paymentStatus = "paid";
          const user = db.users().find((u) => u.id === order.userId);
          if (user) {
            user.loyaltyPoints += Math.round(order.totalUsd);
            user.pendingPoints = Math.max(0, user.pendingPoints - Math.round(order.totalUsd));
            user.tier = tierFromPoints(user.loyaltyPoints);
          }
        }
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }
  return NextResponse.json({ received: true });
}
