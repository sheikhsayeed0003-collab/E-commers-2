"use client";

import { useEffect } from "react";
import { useShop } from "@/lib/useShop";

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useShop((s) => s.setUser);
  const setAuthReady = useShop((s) => s.setAuthReady);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, [setUser, setAuthReady]);

  return <>{children}</>;
}
