"use client";

import { useEffect, useState } from "react";

export default function PoliciesPage() {
  const [note, setNote] = useState("");
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setNote(d.settings?.shippingNote || ""));
  }, []);
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-sm leading-7">
      <h1 className="text-3xl font-light">Shipping, returns & terms</h1>
      <p className="mt-6 text-muted">{note || "Loading…"}</p>
    </div>
  );
}
