import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { products } from "./catalog";
import type { CartItem, Order, Product, SiteSettings, User } from "./types";

const defaultSettings: SiteSettings = {
  announcement:
    "Free express shipping over $250  ·  Monday Program™ now live  ·  Enter the Runner 01 raffle  ·  ",
  marquee: "Limited raffle · MAISON for BMW · Loyalty Gold unlocks early access · ",
  heroKicker: "FALL / WINTER",
  heroTitle: "Monday Program™",
  heroImage: "/products/hero.jpg",
  shippingNote: "Complimentary express shipping on orders over $250. Returns within 14 days.",
};

type State = {
  users: User[];
  products: Product[];
  carts: Record<string, CartItem[]>;
  orders: Order[];
  settings: SiteSettings;
};

function dataPath() {
  const cwd = process.cwd();
  const here = path.join(cwd, "data", "maison.json");
  const nested = path.join(cwd, "E-commers 2", "data", "maison.json");
  try {
    const pkg = JSON.parse(readFileSync(path.join(cwd, "package.json"), "utf8"));
    if (pkg.name === "maison-atelier") return here;
  } catch {
    /* ignore */
  }
  if (existsSync(path.join(cwd, "src", "lib", "store.ts"))) return here;
  return existsSync(nested) || existsSync(path.join(cwd, "E-commers 2", "package.json")) ? nested : here;
}

function seed(): State {
  const adminHash = bcrypt.hashSync("Admin123!", 10);
  const demoHash = bcrypt.hashSync("Demo123!", 10);
  return {
    products: structuredClone(products),
    carts: {},
    orders: [
      {
        id: "ord_1001",
        userId: "u_demo",
        items: [
          {
            productId: "p11",
            slug: "wool-cap",
            name: "Wool Cap",
            image: products.find((p) => p.id === "p11")!.images[0],
            priceUsd: 95,
            color: "Black",
            size: "OS",
            qty: 1,
          },
        ],
        totalUsd: 95,
        currency: "USD",
        stripePaymentId: "pi_demo_paid",
        paymentStatus: "paid",
        deliveryStatus: "delivered",
        shipping: {
          name: "A. Rahman",
          line1: "12 Gulshan Avenue",
          city: "Dhaka",
          country: "BD",
          postal: "1212",
        },
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
    ],
    users: [
      {
        id: "u_admin",
        name: "Maison Admin",
        email: "admin@maisonatelier.com",
        passwordHash: adminHash,
        role: "admin",
        loyaltyPoints: 0,
        pendingPoints: 0,
        tier: "Platinum",
        createdAt: new Date().toISOString(),
      },
      {
        id: "u_demo",
        name: "Ayesha Rahman",
        email: "demo@maisonatelier.com",
        passwordHash: demoHash,
        role: "customer",
        loyaltyPoints: 1840,
        pendingPoints: 95,
        tier: "Gold",
        createdAt: new Date().toISOString(),
      },
    ],
    settings: { ...defaultSettings },
  };
}

function refreshCatalog(state: State) {
  let changed = false;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  for (const p of state.products) {
    const seed = byId[p.id];
    if (seed) {
      if (JSON.stringify(p.images) !== JSON.stringify(seed.images)) {
        p.images = seed.images;
        changed = true;
      }
      if (JSON.stringify(p.lookItems || []) !== JSON.stringify(seed.lookItems || [])) {
        p.lookItems = seed.lookItems;
        changed = true;
      }
    } else if (!p.images?.length) {
      p.images = ["/placeholder.svg"];
      changed = true;
    }
  }
  for (const seed of products) {
    if (!state.products.some((p) => p.id === seed.id)) {
      state.products.push(structuredClone(seed));
      changed = true;
    }
  }
  if (state.settings && (state.settings.heroImage?.includes("unsplash") || !state.settings.heroImage)) {
    state.settings.heroImage = "/products/hero.jpg";
    changed = true;
  }
  return changed;
}

let cache: State | null = null;
let cacheMtime = 0;

function readState(): State {
  const file = dataPath();
  if (existsSync(file)) {
    const mtime = statSync(file).mtimeMs;
    if (cache && cacheMtime === mtime) return cache;
    cache = JSON.parse(readFileSync(file, "utf8")) as State;
    if (!cache.settings) cache.settings = { ...defaultSettings };
    if (refreshCatalog(cache)) {
      saveState();
      return cache;
    }
    cacheMtime = mtime;
    return cache;
  }
  cache = seed();
  saveState();
  return cache;
}

export function saveState() {
  const file = dataPath();
  mkdirSync(path.dirname(file), { recursive: true });
  const state = cache || readState();
  writeFileSync(file, JSON.stringify(state, null, 2));
  cache = state;
  cacheMtime = existsSync(file) ? statSync(file).mtimeMs : Date.now();
}

export const db = {
  products: () => readState().products,
  users: () => readState().users,
  carts: () => readState().carts,
  orders: () => readState().orders,
  settings: () => readState().settings,
};

export function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function tierFromPoints(points: number) {
  if (points >= 4000) return "Platinum" as const;
  if (points >= 1500) return "Gold" as const;
  return "Silver" as const;
}
