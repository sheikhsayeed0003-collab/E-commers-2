"use client";

import Link from "next/link";
import { useShop } from "@/lib/useShop";

export function Footer() {
  const { currency, setCurrency } = useShop();
  return (
    <footer className="mt-8 border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 px-5 py-16 md:gap-12 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl tracking-[0.22em]">MAISON</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            A luxury streetwear and lifestyle house. Limited drops, collaborations, and a members loyalty program.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[11px] tracking-[0.22em] uppercase">Client care</p>
          <div className="mt-4 flex flex-col gap-2.5 text-muted">
            <Link href="/policies" className="hover:text-ink">
              Shipping & returns
            </Link>
            <Link href="/policies" className="hover:text-ink">
              Privacy policy
            </Link>
            <Link href="/policies" className="hover:text-ink">
              Terms of sale
            </Link>
            <Link href="/login" className="hover:text-ink">
              Chat with us
            </Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-[11px] tracking-[0.22em] uppercase">Explore</p>
          <div className="mt-4 flex flex-col gap-2.5 text-muted">
            <Link href="/shop/mens" className="hover:text-ink">
              Mens
            </Link>
            <Link href="/shop/womens" className="hover:text-ink">
              Womens
            </Link>
            <Link href="/shop/footwear" className="hover:text-ink">
              Footwear
            </Link>
            <Link href="/collaborations" className="hover:text-ink">
              Collaborations
            </Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-[11px] tracking-[0.22em] uppercase">Currency</p>
          <select
            className="mt-4 border border-line bg-transparent px-3 py-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "USD" | "BDT")}
          >
            <option value="USD">USD $</option>
            <option value="BDT">BDT ৳</option>
          </select>
          <div className="mt-6 flex gap-4 text-muted">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-ink">
              Instagram
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-ink">
              X
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-[11px] tracking-[0.16em] text-muted">
        © {new Date().getFullYear()} MAISON ATELIER · ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}
