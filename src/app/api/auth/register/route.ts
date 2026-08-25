import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, nextId, saveState, tierFromPoints } from "@/lib/store";
import { toSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (db.users().some((u) => u.email.toLowerCase() === email)) {
      return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 409 });
    }

    const user = {
      id: nextId("u"),
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role: "customer" as const,
      loyaltyPoints: 0,
      pendingPoints: 0,
      tier: tierFromPoints(0),
      createdAt: new Date().toISOString(),
    };
    db.users().push(user);
    saveState();

    const session = toSession(user);
    await setSessionCookie(session);
    return NextResponse.json({ user: session, message: "Account created successfully." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sign up failed. Try again." }, { status: 500 });
  }
}
