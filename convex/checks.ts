import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { filterTraits } from "./validators";

/*
 * Read-only data for the maintenance scripts (pnpm check:filter-key,
 * pnpm measure:draft), run through the Convex CLI.
 */

/** Launch species with their filter traits, for the acceptance check. */
export const launchTraits = internalQuery({
  args: {},
  returns: v.array(v.object({ name: v.string(), traits: filterTraits })),
  handler: async (ctx) => {
    const species = await ctx.db.query("species").take(500);
    return species
      .filter((item) => item.launchWave === "launch")
      .map((item) => ({
        name: item.name.da,
        traits: item.filterTraits ?? {},
      }));
  },
});

/** One species' name, Latin name and warning flag, by slug. */
export const speciesBySlug = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      name: v.string(),
      latinName: v.string(),
      isWarning: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("species")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return item
      ? {
          name: item.name.da,
          latinName: item.latinName,
          isWarning: item.isWarning,
        }
      : null;
  },
});
