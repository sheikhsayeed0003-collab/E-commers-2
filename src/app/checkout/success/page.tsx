"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function Inner() {
  const id = useSearchParams().get("id");
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="text-xs tracking-[0.3em]">THANK YOU</p>
      <h1 className="mt-3 text-4xl font-light">Order confirmed</h1>
      <p className="mt-4 text-sm text-muted">Reference {id}. Payment marked paid. Loyalty points are pending until delivery.</p>
      <Link href="/account" className="mt-8 inline-block underline">
        View orders
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
