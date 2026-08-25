"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function CollaborationsPage() {
  const [list, setList] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products?collaboration=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setList(d.products || []));
  }, []);
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12">
      <h1 className="text-4xl font-light">Collaborations</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        House partnerships with automotive, sport, and culture. Limited allocations, numbered editions.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
