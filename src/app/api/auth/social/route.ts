import { NextResponse } from "next/server";
import { getSession, toSession } from "@/lib/auth";
import { db, nextId, saveState, tierFromPoints } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();
    if (provider !== "google" && provider !== "apple") {
      return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
    }

    let session = await getSession();
    if (!session) {
      const email = provider === "apple" ? "apple.guest@maisonatelier.com" : "google.guest@maisonatelier.com";
      let existing = db.users().find((u) => u.email === email);
      if (!existing) {
        existing = {
          id: nextId("u"),
          name: provider === "apple" ? "Apple Guest" : "Google Guest",
          email,
          passwordHash: bcrypt.hashSync(`social-${provider}`, 10),
          role: "customer",
          loyaltyPoints: 120,
          pendingPoints: 0,
          tier: tierFromPoints(120),
          createdAt: new Date().toISOString(),
        };
        db.users().push(existing);
        saveState();
      }
      session = toSession(existing);
      await setSessionCookie(session);
    }

    return NextResponse.json({
      user: session,
      message: "Signed in successfully.",
      note: "Demo social login — connect real Google/Apple OAuth in production.",
    });
  } catch {
    return NextResponse.json({ error: "Social login failed." }, { status: 500 });
  }
}
