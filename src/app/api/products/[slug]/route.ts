import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = db.products().find((p) => p.slug === slug && !p.hidden);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const related = db
    .products()
    .filter(
      (p) =>
        !p.hidden &&
        p.id !== product.id &&
        (p.category === product.category || p.collection === product.collection)
    )
    .slice(0, 4);
  return NextResponse.json({ product, related });
}
