import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const order = db.orders().find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lines = [
    "MAISON ATELIER — INVOICE",
    `Order: ${order.id}`,
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    `Bill to: ${order.shipping.name}`,
    `${order.shipping.line1}, ${order.shipping.city} ${order.shipping.postal}`,
    "",
    ...order.items.map((i) => `${i.qty} x ${i.name} (${i.color}/${i.size})  $${i.priceUsd * i.qty}`),
    "",
    `Total: $${order.totalUsd}`,
    `Payment: ${order.paymentStatus}`,
    `Fulfillment: ${order.deliveryStatus}`,
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename=invoice-${order.id}.txt`,
    },
  });
}
