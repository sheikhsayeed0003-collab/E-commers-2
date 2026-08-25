"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const cats = ["all", "apparel", "outerwear", "knitwear", "footwear", "denim", "trousers", "accessories", "lifestyle"];
const genders = ["mens", "womens", "kids", "footwear", "all"];

export default function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("all");
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, s]) => {
      setGender(p.gender);
      setCategory(s.category || "all");
    });
  }, [params, searchParams]);

  useEffect(() => {
    if (!gender) return;
    const q = new URLSearchParams();
    if (gender === "footwear") q.set("category", category !== "all" ? category : "footwear");
    else {
      q.set("gender", gender);
      if (category && category !== "all") q.set("category", category);
    }
    fetch(`/api/products?${q.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setList(d.products || []));
  }, [gender, category]);

  if (gender && !genders.includes(gender)) {
    return <p className="p-10">Shop not found.</p>;
  }
  const title = gender === "footwear" ? "Footwear" : gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Shop";

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-muted">Shop</p>
      <h1 className="mt-2 text-4xl font-light">{title}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <a
            key={c}
            href={`/shop/${gender || "mens"}?category=${c}`}
            className={`border px-3 py-1 text-[11px] tracking-[0.16em] uppercase ${
              category === c ? "border-ink bg-ink text-white" : "border-line"
            }`}
          >
            {c}
          </a>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
