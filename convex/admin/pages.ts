import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { adminArgs, requireAdmin } from "../lib/admin";

const pageSlug = v.union(v.literal("about"), v.literal("whereToGetWood"));

/** A static page's Danish title and text, for the page editor. */
export const get = query({
  args: { ...adminArgs, slug: pageSlug },
  returns: v.object({ title: v.string(), content: v.string() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return { title: page?.title.da ?? "", content: page?.content.da ?? "" };
  },
});

/** Saves a static page's Danish title and text; English is kept. */
export const save = mutation({
  args: {
    ...adminArgs,
    slug: pageSlug,
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    const title = args.title.trim();
    const content = args.content.trim();
    if (page) {
      await ctx.db.patch("pages", page._id, {
        title: { ...page.title, da: title },
        content: { ...page.content, da: content },
      });
    } else {
      await ctx.db.insert("pages", {
        slug: args.slug,
        title: { da: title },
        content: { da: content },
      });
    }
    return null;
  },
});
