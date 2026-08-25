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

const g = globalThis as unknown as { __maisonState?: State; __maisonMtime?: number };

function isVercel() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function dataPath() {
  return path.join(process.cwd(), "data", "maison.json");
}

function seed(): State {
  const adminHash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || "Admin123!", 10);
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
        email: process.env.SEED_ADMIN_EMAIL || "admin@maisonatelier.com",
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
    const item = byId[p.id];
    if (item) {
      if (JSON.stringify(p.images) !== JSON.stringify(item.images)) {
        p.images = item.images;
        changed = true;
      }
      if (JSON.stringify(p.lookItems || []) !== JSON.stringify(item.lookItems || [])) {
        p.lookItems = item.lookItems;
        changed = true;
      }
    } else if (!p.images?.length) {
      p.images = ["/placeholder.svg"];
      changed = true;
    }
  }
  for (const item of products) {
    if (!state.products.some((p) => p.id === item.id)) {
      state.products.push(structuredClone(item));
      changed = true;
    }
  }
  if (state.settings && (state.settings.heroImage?.includes("unsplash") || !state.settings.heroImage)) {
    state.settings.heroImage = "/products/hero.jpg";
    changed = true;
  }
  return changed;
}

function readState(): State {
  if (g.__maisonState) {
    refreshCatalog(g.__maisonState);
    return g.__maisonState;
  }

  if (!isVercel()) {
    try {
      const file = dataPath();
      if (existsSync(file)) {
        const mtime = statSync(file).mtimeMs;
        if (g.__maisonState && g.__maisonMtime === mtime) return g.__maisonState;
        const parsed = JSON.parse(readFileSync(file, "utf8")) as State;
        if (!parsed.settings) parsed.settings = { ...defaultSettings };
        refreshCatalog(parsed);
        g.__maisonState = parsed;
        g.__maisonMtime = mtime;
        return parsed;
      }
    } catch {
      /* fall through to memory seed */
    }
  }

  const state = seed();
  refreshCatalog(state);
  g.__maisonState = state;
  if (!isVercel()) {
    try {
      saveState();
    } catch {
      /* ignore on restricted FS */
    }
  }
  return state;
}

export function saveState() {
  const state = g.__maisonState || readState();
  g.__maisonState = state;
  if (isVercel()) {
    g.__maisonMtime = Date.now();
    return;
  }
  try {
    const file = dataPath();
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(state, null, 2));
    g.__maisonMtime = existsSync(file) ? statSync(file).mtimeMs : Date.now();
  } catch {
    g.__maisonMtime = Date.now();
  }
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
