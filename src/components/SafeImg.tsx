"use client";

import { useState } from "react";

const FALLBACK = "/placeholder.svg";

export function SafeImg({
  src,
  alt = "",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  const url = !src || err ? FALLBACK : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setErr(true)}
    />
  );
}
