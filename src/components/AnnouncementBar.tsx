"use client";

import { useEffect, useState } from "react";

export function AnnouncementBar() {
  const [text, setText] = useState(
    "Free express shipping over $250  ·  Monday Program™ now live  ·  Enter the Runner 01 raffle  ·  "
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.announcement) setText(d.settings.announcement);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden border-b border-line bg-ink text-[11px] tracking-[0.22em] uppercase text-white">
      <div className="marquee-track flex w-max py-2">
        <span className="px-8">{text.repeat(6)}</span>
        <span className="px-8">{text.repeat(6)}</span>
      </div>
    </div>
  );
}
