import { ConvexError, v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Arguments every admin function accepts. `adminSecret` is the interim
 * credential from architecture.md §6: the Next.js server passes it after the
 * placeholder login, and it is removed once Clerk is wired in.
 */
export const adminArgs = { adminSecret: v.optional(v.string()) };

/**
 * Throws unless the caller is an admin: either a signed-in user whose
 * `users` row has the admin role, or (interim) the server-held secret.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  adminSecret: string | undefined,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user?.role === "admin") return;
    throw new ConvexError("Du har ikke adgang til administrationen.");
  }
  if (secretMatches(adminSecret)) return;
  throw new ConvexError("Du har ikke adgang til administrationen.");
}

function secretMatches(given: string | undefined): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !given || given.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return difference === 0;
}
