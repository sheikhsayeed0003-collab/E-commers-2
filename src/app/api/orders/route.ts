import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ orders: [] });
  const orders = db.orders().filter((o) => o.userId === session.id);
  return NextResponse.json({ orders });
}
