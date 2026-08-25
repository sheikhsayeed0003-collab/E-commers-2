import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const collab = searchParams.get("collaboration");
  const q = searchParams.get("q")?.toLowerCase();
  let items = db.products().filter((p) => !p.hidden);
  if (gender && gender !== "all") {
    items = items.filter((p) => p.gender === gender || p.gender === "unisex");
  }
  if (category) items = items.filter((p) => p.category === category);
  if (collection) items = items.filter((p) => p.collection === collection);
  if (collab === "1") items = items.filter((p) => Boolean(p.collaboration));
  if (q) items = items.filter((p) => `${p.name} ${p.description} ${p.collection}`.toLowerCase().includes(q));
  return NextResponse.json(
    { products: items },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
