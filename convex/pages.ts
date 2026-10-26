import { v } from "convex/values";
import { query } from "./_generated/server";
import { pick } from "./lib/localize";
import { publicPage } from "./returns";
import { locale } from "./validators";

/** A static page (about, where to get wood) in one locale, or null. */
export const get = query({
  args: {
    slug: v.union(v.literal("about"), v.literal("whereToGetWood")),
    locale,
  },
  returns: v.union(publicPage, v.null()),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!page) return null;
    return {
      title: pick(page.title, args.locale),
      content: pick(page.content, args.locale),
    };
  },
});
