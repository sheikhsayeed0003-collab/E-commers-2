"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Suspense } from "react";
import type { Product } from "@/lib/types";

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`/api/products?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setList(d.products || []));
  }, [q]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12">
      <h1 className="text-3xl font-light">Search “{q}”</h1>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
