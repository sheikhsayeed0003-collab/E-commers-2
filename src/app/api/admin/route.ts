import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db, nextId, saveState, tierFromPoints } from "@/lib/store";
import type { Category, Gender, LoyaltyTier, Product, Role, Variant } from "@/lib/types";

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const orders = db.orders();
  const revenue = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.totalUsd, 0);
  return NextResponse.json({
    stats: {
      revenue,
      orders: orders.length,
      paid: orders.filter((o) => o.paymentStatus === "paid").length,
      live: orders.filter((o) => o.deliveryStatus === "processing").length,
      customers: db.users().filter((u) => u.role === "customer").length,
    },
    orders,
    users: db.users().map(({ passwordHash: _p, ...u }) => u),
    products: db.products(),
    settings: db.settings(),
  });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  if (body.type === "settings") {
    Object.assign(db.settings(), body.patch || {});
    saveState();
    revalidatePath("/", "layout");
    return NextResponse.json({ settings: db.settings() });
  }

  if (body.type === "order") {
    const order = db.orders().find((o) => o.id === body.id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.deliveryStatus) order.deliveryStatus = body.deliveryStatus;
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.shipping) Object.assign(order.shipping, body.shipping);
    saveState();
    revalidatePath("/", "layout");
    return NextResponse.json({ order });
  }

  if (body.type === "user") {
    const user = db.users().find((u) => u.id === body.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.name === "string") user.name = body.name;
    if (typeof body.loyaltyPoints === "number") {
      user.loyaltyPoints = body.loyaltyPoints;
      user.tier = tierFromPoints(user.loyaltyPoints);
    }
    if (typeof body.pendingPoints === "number") user.pendingPoints = body.pendingPoints;
    if (body.tier) user.tier = body.tier as LoyaltyTier;
    if (typeof body.blocked === "boolean") user.blocked = body.blocked;
    if (body.role && user.id !== "u_admin") user.role = body.role as Role;
    saveState();
    return NextResponse.json({ user: { ...user, passwordHash: undefined } });
  }

  if (body.type === "product") {
    const product = db.products().find((p) => p.id === body.id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const patch = body.patch as Partial<Product>;
    Object.assign(product, patch);
    if (patch.variants) product.variants = patch.variants;
    saveState();
    revalidatePath("/", "layout");
    return NextResponse.json({ product });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const variants: Variant[] = body.variants?.length
    ? body.variants
    : [{ color: body.color || "Black", size: body.size || "M", stock: Number(body.stock || 10), sku: "NEW-M" }];
  const product: Product = {
    id: nextId("p"),
    slug: String(body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    name: body.name,
    description: body.description || "",
    priceUsd: Number(body.priceUsd),
    images: String(body.images || "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean),
    gender: (body.gender || "unisex") as Gender | "unisex",
    category: (body.category || "apparel") as Category,
    collection: body.collection || "Core",
    collaboration: body.collaboration || undefined,
    variants,
    featured: body.featured !== false,
    hidden: Boolean(body.hidden),
  };
  if (!product.images.length) {
    product.images = ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"];
  }
  const existing = db.products().find((p) => p.slug === product.slug);
  if (existing) product.slug = `${product.slug}-${product.id}`;
  db.products().unshift(product);
  saveState();
  revalidatePath("/", "layout");
  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const list = db.products();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list.splice(i, 1);
  saveState();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
