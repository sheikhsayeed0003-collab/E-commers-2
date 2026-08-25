"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useShop } from "@/lib/useShop";
import { SafeImg } from "@/components/SafeImg";

export function ProductCard({ product }: { product: Product }) {
  const currency = useShop((s) => s.currency);
  const a = product.images?.[0] || "/placeholder.svg";
  const b = product.images?.[1] || a;
  return (
    <Link href={`/product/${product.slug}`} className="product-card group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe8e2]">
        <SafeImg
          src={a}
          alt={product.name}
          className="product-img-a absolute inset-0 h-full w-full object-cover transition duration-700"
        />
        <SafeImg
          src={b}
          alt=""
          className="product-img-b absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700"
        />
        {product.collaboration && (
          <span className="absolute left-2 top-2 bg-ink/90 px-2 py-1 text-[9px] tracking-[0.18em] text-white">
            COLLAB
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[13px] font-medium leading-snug">{product.name}</p>
          <p className="shrink-0 text-[13px]">{formatMoney(product.priceUsd, currency)}</p>
        </div>
        <p className="truncate text-[11px] tracking-[0.08em] text-muted">{product.collection}</p>
      </div>
    </Link>
  );
}
