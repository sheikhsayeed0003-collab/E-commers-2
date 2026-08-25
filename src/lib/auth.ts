import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./store";
import type { SessionUser } from "./types";

const SECRET = process.env.JWT_SECRET || "maison-atelier-dev-secret";

export function signToken(user: SessionUser) {
  return jwt.sign(user, SECRET, { expiresIn: "7d" });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get("maison_token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as SessionUser;
    const live = db.users().find((u) => u.id === payload.id && !u.blocked);
    if (!live) return null;
    return {
      id: live.id,
      name: live.name,
      email: live.email,
      role: live.role,
      loyaltyPoints: live.loyaltyPoints,
      pendingPoints: live.pendingPoints,
      tier: live.tier,
    };
  } catch {
    return null;
  }
}

export function toSession(u: {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  loyaltyPoints: number;
  pendingPoints: number;
  tier: SessionUser["tier"];
}): SessionUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    loyaltyPoints: u.loyaltyPoints,
    pendingPoints: u.pendingPoints,
    tier: u.tier,
  };
}
