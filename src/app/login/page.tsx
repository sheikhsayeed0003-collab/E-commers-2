"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShop } from "@/lib/useShop";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useShop((s) => s.setUser);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      setUser(data.user);
      router.push(data.user.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function social(provider: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Social login failed.");
        return;
      }
      setUser(data.user);
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">Account</p>
      <h1 className="mt-2 font-display text-4xl font-light">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Welcome back to MAISON.</p>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[11px] tracking-[0.16em] uppercase text-muted">Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            className="w-full border border-line bg-transparent px-3 py-3 outline-none focus:border-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[11px] tracking-[0.16em] uppercase text-muted">Password</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            className="w-full border border-line bg-transparent px-3 py-3 outline-none focus:border-ink"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-3.5 text-[11px] tracking-[0.28em] text-white disabled:opacity-50"
        >
          {loading ? "PLEASE WAIT…" : "SIGN IN"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] tracking-[0.16em] text-muted">
        <span className="h-px flex-1 bg-line" />
        OR
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => social("google")}
          className="border border-line py-3 text-[11px] tracking-[0.2em] disabled:opacity-50"
        >
          CONTINUE WITH GOOGLE
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => social("apple")}
          className="border border-line py-3 text-[11px] tracking-[0.2em] disabled:opacity-50"
        >
          CONTINUE WITH APPLE
        </button>
      </div>

      <p className="mt-8 text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Demo — Customer: demo@maisonatelier.com / Demo123!
        <br />
        Admin: admin@maisonatelier.com / Admin123!
      </p>
    </div>
  );
}
