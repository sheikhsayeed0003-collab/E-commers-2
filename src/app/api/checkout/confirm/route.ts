import { NextResponse } from "next/server";
import { db, saveState, tierFromPoints } from "@/lib/store";

/** Mark order paid after Stripe.js confirms the PaymentIntent on the client. */
export async function POST(req: Request) {
  const body = await req.json();
  const orderId = body.orderId as string | undefined;
  const paymentIntentId = body.paymentIntentId as string | undefined;
  if (!orderId || !paymentIntentId) {
    return NextResponse.json({ error: "Missing order or payment id" }, { status: 400 });
  }

  const order = db.orders().find((o) => o.id === orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "paid") return NextResponse.json({ order, paid: true });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_")) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.orderId !== orderId && order.stripePaymentId !== paymentIntentId) {
      return NextResponse.json({ error: "Payment does not match order" }, { status: 400 });
    }
    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: `Payment status: ${intent.status}` }, { status: 402 });
    }

    order.paymentStatus = "paid";
    order.stripePaymentId = intent.id;

    const user = db.users().find((u) => u.id === order.userId);
    if (user) {
      user.loyaltyPoints += Math.round(order.totalUsd);
      user.pendingPoints = Math.max(0, user.pendingPoints - Math.round(order.totalUsd));
      user.tier = tierFromPoints(user.loyaltyPoints);
    }

    saveState();
    return NextResponse.json({ order, paid: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Confirm failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
