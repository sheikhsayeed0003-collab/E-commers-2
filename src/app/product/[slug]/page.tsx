"use client";

import { use, useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/catalog";
import { useShop } from "@/lib/useShop";
import { ProductCard } from "@/components/ProductCard";
import { SafeImg } from "@/components/SafeImg";
import type { Product } from "@/lib/types";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [missing, setMissing] = useState(false);
  const currency = useShop((s) => s.currency);
  const addItem = useShop((s) => s.addItem);
  const colors = useMemo(() => [...new Set(product?.variants.map((v) => v.color) || [])], [product]);
  const [color, setColor] = useState("");
  const sizes = product?.variants.filter((v) => v.color === color) || [];
  const [size, setSize] = useState("");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("missing");
        return r.json();
      })
      .then((d) => {
        setProduct(d.product);
        setRelated(d.related || []);
        const first = d.product.variants[0];
        setColor(first?.color || "");
        setSize(first?.size || "");
      })
      .catch(() => setMissing(true));
  }, [slug]);

  useEffect(() => {
    const next = product?.variants.filter((v) => v.color === color) || [];
    setSize((prev) => (next.some((v) => v.size === prev) ? prev : next[0]?.size || ""));
  }, [color, product]);

  const stock = sizes.find((v) => v.size === size)?.stock || 0;

  if (missing) return <p className="p-10">Product not found.</p>;
  if (!product) return <p className="p-10 text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="grid gap-3">
          {product.images.map((src) => (
            <div key={src} className="overflow-hidden bg-[#eceae4]">
              <SafeImg src={src} alt={product.name} className="aspect-[3/4] w-full object-cover" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted">{product.collection}</p>
          <h1 className="mt-3 text-4xl font-light">{product.name}</h1>
          {product.collaboration && <p className="mt-2 text-sm">{product.collaboration}</p>}
          <p className="mt-4 text-xl">{formatMoney(product.priceUsd, currency)}</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">{product.description}</p>
          <p className="mt-8 text-xs tracking-[0.2em]">COLOR</p>
          <div className="mt-2 flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`border px-3 py-1 text-sm ${color === c ? "border-ink" : "border-line"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs tracking-[0.2em]">SIZE</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((v) => (
              <button
                key={v.sku}
                type="button"
                onClick={() => setSize(v.size)}
                className={`border px-3 py-1 text-sm ${size === v.size ? "border-ink bg-ink text-white" : "border-line"}`}
              >
                {v.size}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{stock} in stock</p>
          {product.collection === "Drawings" && (
            <p className="mt-4 border border-accent px-4 py-3 text-sm text-accent">
              This pair is released through a registered raffle. Add to bag to reserve your draw entry.
            </p>
          )}
          <button
            type="button"
            disabled={!stock}
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                priceUsd: product.priceUsd,
                color,
                size,
                qty: 1,
              })
            }
            className="mt-8 w-full bg-ink py-4 text-xs tracking-[0.3em] text-white disabled:opacity-40"
          >
            ADD TO BAG
          </button>
        </div>
      </div>
      <h2 className="mt-20 text-2xl font-light">You may also like</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
