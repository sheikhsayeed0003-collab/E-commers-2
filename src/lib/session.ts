import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { signToken } from "./auth";

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  jar.set("maison_token", signToken(user), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set("maison_token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
