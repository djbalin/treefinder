import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Gives a signed-in user the admin role. There is no public sign-up: run it
 * from the CLI with the user's token identifier (issuer|subject from Clerk).
 *
 *   npx convex run users:grantAdmin '{"tokenIdentifier": "...", "email": "..."}'
 */
export const grantAdmin = internalMutation({
  args: { tokenIdentifier: v.string(), email: v.optional(v.string()) },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier),
      )
      .unique();
    if (existing) {
      await ctx.db.patch("users", existing._id, { role: "admin" });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      role: "admin",
    });
  },
});
