import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/store";
import { toSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = db.users().find((u) => u.email.toLowerCase() === email);
    if (!user || user.blocked) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (user.passwordHash === "social" || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = toSession(user);
    await setSessionCookie(session);
    return NextResponse.json({ user: session, message: "Logged in successfully." });
  } catch {
    return NextResponse.json({ error: "Login failed. Try again." }, { status: 500 });
  }
}
