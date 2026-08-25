"use client";

import Link from "next/link";
import { LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useShop } from "@/lib/useShop";
import { useRouter } from "next/navigation";
import { logoutClient } from "@/lib/authClient";

const links = [
  ["Mens", "/shop/mens"],
  ["Womens", "/shop/womens"],
  ["Kids", "/shop/kids"],
  ["Footwear", "/shop/footwear"],
  ["Collaborations", "/collaborations"],
];

export function Header() {
  const { cart, setCartOpen, user, authReady } = useShop();
  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutClient();
    setMenu(false);
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e4df] bg-[#f6f5f2]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4">
        <button className="md:hidden" type="button" aria-label="Menu" onClick={() => setMenu(true)}>
          <Menu size={18} />
        </button>
        <nav className="hidden items-center gap-6 text-[11px] tracking-[0.22em] uppercase text-[#0a0a0a] md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="bg-ink px-3 py-1.5 text-white transition hover:bg-[#222]"
            >
              Admin
            </Link>
          )}
        </nav>
        <Link href="/" className="font-display text-[28px] font-medium tracking-[0.28em] text-[#0a0a0a]">
          MAISON
        </Link>
        <div className="flex items-center gap-3 text-[#0a0a0a] md:gap-4">
          {openSearch ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/search?q=${encodeURIComponent(q)}`);
                setOpenSearch(false);
              }}
            >
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="w-32 border-b border-[#0a0a0a] bg-transparent py-1 text-sm outline-none md:w-40"
              />
            </form>
          ) : (
            <button type="button" onClick={() => setOpenSearch(true)} aria-label="Search">
              <Search size={18} />
            </button>
          )}

          {authReady && !user && (
            <div className="hidden items-center gap-3 text-[11px] tracking-[0.18em] uppercase sm:flex">
              <Link href="/login" className="hover:opacity-60">
                Sign in
              </Link>
              <Link href="/register" className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-white">
                Sign up
              </Link>
            </div>
          )}

          {authReady && user && (
            <div className="hidden items-center gap-3 text-[11px] tracking-[0.14em] uppercase sm:flex">
              {user.role === "admin" && (
                <Link href="/admin" className="bg-ink px-3 py-1.5 text-white hover:bg-[#222]">
                  Admin
                </Link>
              )}
              <Link href={user.role === "admin" ? "/admin" : "/account"} className="max-w-[120px] truncate hover:opacity-60">
                {user.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 hover:opacity-60 disabled:opacity-50"
                aria-label="Log out"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}

          <Link
            href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
            aria-label="Account"
            className="sm:hidden"
          >
            <User size={18} />
          </Link>
          <button type="button" className="relative" onClick={() => setCartOpen(true)} aria-label="Cart">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-[#0a0a0a] text-[10px] text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      {mounted &&
        menu &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col bg-[#f6f5f2] px-6 py-6 md:hidden">
            <div className="flex items-center justify-between">
              <p className="font-display text-[22px] tracking-[0.28em] text-[#0a0a0a]">MAISON</p>
              <button type="button" aria-label="Close menu" className="text-[#0a0a0a]" onClick={() => setMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="mt-14 flex flex-col gap-6 text-[15px] tracking-[0.28em] uppercase text-[#0a0a0a]">
              {links.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-[#6b6b6b]" onClick={() => setMenu(false)}>
                  {label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-block w-fit bg-ink px-4 py-2 text-white"
                  onClick={() => setMenu(false)}
                >
                  Admin
                </Link>
              )}
              <div className="mt-4 h-px bg-line" />
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setMenu(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMenu(false)}>
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/account"} onClick={() => setMenu(false)}>
                    My account
                  </Link>
                  <button type="button" className="text-left" onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? "Logging out…" : "Logout"}
                  </button>
                </>
              )}
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
}
