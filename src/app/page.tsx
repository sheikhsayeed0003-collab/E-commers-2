"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SafeImg } from "@/components/SafeImg";
import { ProductCard } from "@/components/ProductCard";
import type { Product, SiteSettings } from "@/lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  const looks = products.filter((p) => p.lookItems?.length);
  const featured = products.filter((p) => p.featured);
  const footwear = products.filter((p) => p.category === "footwear");
  const collabs = products.filter((p) => p.collaboration);
  const latest = products.slice(0, 10);

  return (
    <div>
      <section className="relative h-[86vh] min-h-[560px] overflow-hidden bg-black">
        <SafeImg
          src={settings?.heroImage || "/products/hero.jpg"}
          alt=""
          className="hero-video h-full w-full scale-105 object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12"
        >
          <p className="font-display text-6xl tracking-[0.2em] text-white md:text-8xl">MAISON</p>
          <p className="mt-4 text-[11px] tracking-[0.42em] text-white/80">
            {settings?.heroKicker || "FALL / WINTER"}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-light text-white md:text-5xl">
            {settings?.heroTitle || "Monday Program™"}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Limited drops, house collaborations, and quiet luxury essentials.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop/mens"
              className="bg-white px-8 py-3 text-[11px] tracking-[0.28em] text-ink transition hover:bg-paper"
            >
              SHOP THE DROP
            </Link>
            <Link
              href="/collaborations"
              className="border border-white/70 px-8 py-3 text-[11px] tracking-[0.28em] text-white transition hover:bg-white/10"
            >
              COLLABORATIONS
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="overflow-hidden border-y border-line bg-ink py-3 text-white">
        <div className="marquee-track flex w-max text-[11px] tracking-[0.32em] uppercase">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="px-8">
              {settings?.marquee || "Limited raffle · MAISON for BMW · Loyalty Gold unlocks early access · "}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">New arrivals</p>
            <h2 className="mt-2 font-display text-4xl font-light md:text-5xl">Latest</h2>
          </div>
          <Link href="/shop/all" className="text-[11px] tracking-[0.22em] underline underline-offset-4">
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-5">
          <div className="mb-10">
            <p className="section-label">Editorial</p>
            <h2 className="mt-2 font-display text-4xl font-light md:text-5xl">Shop the look</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {(looks.length ? looks : featured.slice(0, 2)).slice(0, 2).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden"
              >
                <SafeImg
                  src={p.images[0]}
                  alt=""
                  className="h-[68vh] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 text-white">
                  <p className="text-sm tracking-[0.12em]">{p.name}</p>
                  <p className="mt-1 text-xs text-white/70">Complete the look</p>
                  <Link
                    href={`/product/${p.slug}`}
                    className="mt-4 inline-block border border-white/80 px-4 py-2 text-[10px] tracking-[0.22em]"
                  >
                    QUICK VIEW
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="section-label">Featured</p>
            <h2 className="mt-2 font-display text-4xl font-light">House picks</h2>
          </div>
          <Link href="/shop/all" className="text-[11px] tracking-[0.22em] underline underline-offset-4">
            SHOP ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {featured.slice(0, 10).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-[#111] py-20">
        <div className="mx-auto max-w-[1440px] px-5">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-white/55">Footwear</p>
              <h2 className="mt-2 font-display text-4xl font-light text-white">Drop 08</h2>
            </div>
            <Link href="/shop/footwear" className="text-[11px] tracking-[0.22em] text-white/80 underline underline-offset-4">
              VIEW FOOTWEAR
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
            {footwear.slice(0, 5).map((p) => (
              <div key={p.id} className="bg-paper p-2">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {collabs.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="section-label">Partnerships</p>
              <h2 className="mt-2 font-display text-4xl font-light">Collaborations</h2>
            </div>
            <Link href="/collaborations" className="text-[11px] tracking-[0.22em] underline underline-offset-4">
              SEE ALL
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {collabs.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-[1440px] gap-3 px-5 pb-20 md:grid-cols-3">
        {[
          ["Mens", "/shop/mens", "/products/overcoat-1.jpg", "Tailoring & street"],
          ["Womens", "/shop/womens", "/products/dress-1.jpg", "Atelier essentials"],
          ["Kids", "/shop/kids", "/products/parka-1.jpg", "Soft luxury for little ones"],
        ].map(([label, href, photo, sub]) => (
          <Link key={label} href={href} className="group relative h-[52vh] overflow-hidden">
            <SafeImg
              src={photo}
              alt={label}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="block text-xl tracking-[0.28em]">{label.toUpperCase()}</span>
              <span className="mt-1 block text-xs text-white/70">{sub}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
