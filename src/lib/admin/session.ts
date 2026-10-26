import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * Interim admin sign-in (architecture.md §6): a username and password from
 * the environment and an httpOnly session cookie. Admin calls to Convex then
 * carry ADMIN_SECRET from the server. This module is the one place Clerk
 * replaces once its instance exists.
 */

const COOKIE = "treefinder_admin";
const WEEK = 60 * 60 * 24 * 7;

export function adminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not set.");
  return secret;
}

/** The placeholder login; admin/admin only outside production. */
function credentials(): { username: string; password: string } | null {
  const fallback = process.env.NODE_ENV === "production" ? undefined : "admin";
  const username = process.env.ADMIN_USERNAME ?? fallback;
  const password = process.env.ADMIN_PASSWORD ?? fallback;
  return username && password ? { username, password } : null;
}

function sessionValue(): string {
  return createHmac("sha256", adminSecret())
    .update("admin-session")
    .digest("hex");
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Starts a session when the username and password match. */
export async function signIn(username: string, password: string) {
  const expected = credentials();
  if (
    !expected ||
    !same(username, expected.username) ||
    !same(password, expected.password)
  ) {
    return false;
  }
  (await cookies()).set(COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: WEEK,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isSignedIn(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(value) && same(value ?? "", sessionValue());
}

/** Sends visitors without a session to the login page. */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin/login");
}
