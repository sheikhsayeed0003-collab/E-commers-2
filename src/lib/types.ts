export type Gender = "mens" | "womens" | "kids";
export type Category =
  | "apparel"
  | "outerwear"
  | "knitwear"
  | "footwear"
  | "denim"
  | "trousers"
  | "accessories"
  | "lifestyle";

export type Currency = "USD" | "BDT";

export type LoyaltyTier = "Silver" | "Gold" | "Platinum";

export type Role = "customer" | "admin";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Variant {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceUsd: number;
  images: string[];
  gender: Gender | "unisex";
  category: Category;
  collection: string;
  collaboration?: string;
  variants: Variant[];
  featured?: boolean;
  lookItems?: string[];
  hidden?: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceUsd: number;
  color: string;
  size: string;
  qty: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  loyaltyPoints: number;
  pendingPoints: number;
  tier: LoyaltyTier;
  blocked?: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalUsd: number;
  currency: Currency;
  stripePaymentId?: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: OrderStatus;
  shipping: {
    name: string;
    line1: string;
    city: string;
    country: string;
    postal: string;
  };
  createdAt: string;
}

export interface SiteSettings {
  announcement: string;
  marquee: string;
  heroKicker: string;
  heroTitle: string;
  heroImage: string;
  shippingNote: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  loyaltyPoints: number;
  pendingPoints: number;
  tier: LoyaltyTier;
}
