"use client";

import { useShop } from "@/lib/useShop";

export async function logoutClient() {
  await fetch("/api/auth/logout", { method: "POST" });
  useShop.getState().setUser(null);
}
