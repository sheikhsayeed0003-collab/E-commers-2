"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/useShop";
import type { Order, Product, SiteSettings, User } from "@/lib/types";
import { collectProductImages, ProductImageFields } from "@/components/ProductImageFields";

type Dashboard = {
  stats: { revenue: number; orders: number; paid: number; live: number; customers: number };
  orders: Order[];
  users: Omit<User, "passwordHash">[];
  products: Product[];
  settings: SiteSettings;
};

const input = "w-full border border-line bg-transparent px-3 py-2 text-sm";

async function patch(body: object) {
  return fetch("/api/admin", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default function AdminPage() {
  const user = useShop((s) => s.user);
  const authReady = useShop((s) => s.authReady);
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "users" | "site">("overview");
  const [edit, setEdit] = useState<Product | null>(null);

  async function load() {
    const res = await fetch("/api/admin");
    if (res.status === 403) {
      router.replace("/login");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    if (!authReady) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    load();
  }, [authReady, user, router]);

  if (!authReady || !data) return <p className="p-16 text-sm text-muted">Loading admin…</p>;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <p className="text-xs tracking-[0.3em]">SUPER ADMIN</p>
      <h1 className="mt-2 text-4xl font-light">Full store control</h1>
      <p className="mt-2 text-sm text-muted">
        {user?.email} — products, orders, members, and homepage content all update the live shop.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 text-xs tracking-[0.2em]">
        {(["overview", "products", "orders", "users", "site"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border px-4 py-2 uppercase ${tab === t ? "bg-ink text-white" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {Object.entries(data.stats).map(([k, v]) => (
            <div key={k} className="border border-line p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{k}</p>
              <p className="mt-2 text-2xl">{k === "revenue" ? `$${v}` : v}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "site" && (
        <form
          className="mt-8 grid max-w-3xl gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await patch({
              type: "settings",
              patch: {
                announcement: fd.get("announcement"),
                marquee: fd.get("marquee"),
                heroKicker: fd.get("heroKicker"),
                heroTitle: fd.get("heroTitle"),
                heroImage: fd.get("heroImage"),
                shippingNote: fd.get("shippingNote"),
              },
            });
            load();
          }}
        >
          <input className={input} name="announcement" defaultValue={data.settings.announcement} />
          <input className={input} name="marquee" defaultValue={data.settings.marquee} />
          <input className={input} name="heroKicker" defaultValue={data.settings.heroKicker} />
          <input className={input} name="heroTitle" defaultValue={data.settings.heroTitle} />
          <input className={input} name="heroImage" defaultValue={data.settings.heroImage} />
          <textarea className={input} name="shippingNote" rows={4} defaultValue={data.settings.shippingNote} />
          <button className="bg-ink py-3 text-xs tracking-[0.2em] text-white">SAVE HOMEPAGE & POLICY</button>
        </form>
      )}

      {tab === "products" && (
        <div className="mt-8">
          <form
            className="mb-10 grid gap-3 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              const images = await collectProductImages(fd);
              await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: fd.get("name"),
                  priceUsd: fd.get("priceUsd"),
                  gender: fd.get("gender"),
                  category: fd.get("category"),
                  collection: fd.get("collection"),
                  collaboration: fd.get("collaboration"),
                  description: fd.get("description"),
                  images: images.join("\n"),
                  featured: fd.get("featured") === "on",
                  color: fd.get("color"),
                  size: fd.get("size"),
                  stock: fd.get("stock"),
                }),
              });
              form.reset();
              load();
            }}
          >
            <input className={input} name="name" required placeholder="Name" />
            <input className={input} name="priceUsd" required placeholder="Price USD" />
            <select className={input} name="gender" defaultValue="unisex">
              <option value="mens">mens</option>
              <option value="womens">womens</option>
              <option value="kids">kids</option>
              <option value="unisex">unisex</option>
            </select>
            <select className={input} name="category" defaultValue="apparel">
              {["apparel", "outerwear", "knitwear", "footwear", "denim", "trousers", "accessories", "lifestyle"].map(
                (c) => (
                  <option key={c}>{c}</option>
                )
              )}
            </select>
            <input className={input} name="collection" placeholder="Collection" />
            <input className={input} name="collaboration" placeholder="Collaboration (optional)" />
            <input className={input} name="color" placeholder="Color" defaultValue="Black" />
            <input className={input} name="size" placeholder="Size" defaultValue="M" />
            <input className={input} name="stock" placeholder="Stock" defaultValue="10" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked /> Featured on homepage
            </label>
            <textarea className={`${input} md:col-span-2`} name="description" placeholder="Description" />
            <ProductImageFields />
            <button className="bg-ink py-3 text-xs tracking-[0.2em] text-white">ADD PRODUCT</button>
          </form>

          {data.products.map((p) => (
            <div key={p.id} className="mb-3 border border-line p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p>
                    {p.name} {p.hidden ? "(hidden)" : ""} {p.featured ? "· featured" : ""}
                  </p>
                  <p className="text-muted">
                    ${p.priceUsd} · {p.gender} · {p.category} · {p.collection}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button" className="underline" onClick={() => setEdit(edit?.id === p.id ? null : p)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={async () => {
                      await patch({ type: "product", id: p.id, patch: { hidden: !p.hidden } });
                      load();
                    }}
                  >
                    {p.hidden ? "Show" : "Hide"}
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={async () => {
                      await fetch(`/api/admin?id=${p.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {edit?.id === p.id && (
                <form
                  className="mt-4 grid gap-2 md:grid-cols-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const variants = p.variants.map((v, i) => ({
                      ...v,
                      stock: Number(fd.get(`stock_${i}`)),
                      color: String(fd.get(`color_${i}`)),
                      size: String(fd.get(`size_${i}`)),
                    }));
                    const images = await collectProductImages(fd);
                    await patch({
                      type: "product",
                      id: p.id,
                      patch: {
                        name: fd.get("name"),
                        priceUsd: Number(fd.get("priceUsd")),
                        description: fd.get("description"),
                        collection: fd.get("collection"),
                        collaboration: String(fd.get("collaboration") || "") || undefined,
                        gender: fd.get("gender"),
                        category: fd.get("category"),
                        images,
                        featured: fd.get("featured") === "on",
                        variants,
                      },
                    });
                    setEdit(null);
                    load();
                  }}
                >
                  <input className={input} name="name" defaultValue={p.name} />
                  <input className={input} name="priceUsd" defaultValue={p.priceUsd} />
                  <input className={input} name="gender" defaultValue={p.gender} />
                  <input className={input} name="category" defaultValue={p.category} />
                  <input className={input} name="collection" defaultValue={p.collection} />
                  <input className={input} name="collaboration" defaultValue={p.collaboration || ""} />
                  <textarea className={`${input} md:col-span-2`} name="description" defaultValue={p.description} />
                  <ProductImageFields defaultUrls={p.images.join("\n")} />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="featured" defaultChecked={p.featured} /> Featured
                  </label>
                  {p.variants.map((v, i) => (
                    <div key={v.sku} className="md:col-span-2 grid grid-cols-3 gap-2">
                      <input className={input} name={`color_${i}`} defaultValue={v.color} />
                      <input className={input} name={`size_${i}`} defaultValue={v.size} />
                      <input className={input} name={`stock_${i}`} defaultValue={v.stock} />
                    </div>
                  ))}
                  <button className="bg-ink py-2 text-white">Save product</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8">
          {data.orders.map((o) => (
            <div key={o.id} className="mb-4 border border-line p-4 text-sm">
              <p className="font-medium">{o.id}</p>
              <p className="text-muted">
                ${o.totalUsd} · {o.shipping.name} · {o.shipping.city}
              </p>
              <div className="mt-2 space-y-1 text-muted">
                {o.items.map((i) => (
                  <p key={`${i.productId}${i.size}`}>
                    {i.qty} × {i.name} ({i.color}/{i.size})
                  </p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <select
                  value={o.deliveryStatus}
                  className="border border-line px-2 py-1"
                  onChange={async (e) => {
                    await patch({ type: "order", id: o.id, deliveryStatus: e.target.value });
                    load();
                  }}
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={o.paymentStatus}
                  className="border border-line px-2 py-1"
                  onChange={async (e) => {
                    await patch({ type: "order", id: o.id, paymentStatus: e.target.value });
                    load();
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <a className="underline" href={`/api/admin/invoice?id=${o.id}`}>
                  Invoice
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="mt-8">
          {data.users.map((u) => (
            <form
              key={u.id}
              className="mb-3 grid gap-2 border border-line p-4 text-sm md:grid-cols-6"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await patch({
                  type: "user",
                  id: u.id,
                  name: fd.get("name"),
                  loyaltyPoints: Number(fd.get("loyaltyPoints")),
                  pendingPoints: Number(fd.get("pendingPoints")),
                  role: fd.get("role"),
                  blocked: fd.get("blocked") === "on",
                });
                load();
              }}
            >
              <input className={input} name="name" defaultValue={u.name} />
              <p className="self-center text-muted">{u.email}</p>
              <input className={input} name="loyaltyPoints" defaultValue={u.loyaltyPoints} />
              <input className={input} name="pendingPoints" defaultValue={u.pendingPoints} />
              <select className={input} name="role" defaultValue={u.role} disabled={u.id === "u_admin"}>
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="blocked" defaultChecked={u.blocked} disabled={u.id === "u_admin"} />{" "}
                  Block
                </label>
                <button className="underline">Save</button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
