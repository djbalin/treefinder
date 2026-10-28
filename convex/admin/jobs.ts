import { ConvexError, v } from "convex/values";
import { DRAFTABLE_STATUSES } from "../../src/domain/drafting";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { adminArgs, requireAdmin } from "../lib/admin";

/**
 * Queues a catalog fetch: the next 20 candidates for each of whole tree,
 * bark and leaf, or for one of them ("fetch 20 more").
 */
export const fetchCatalog = mutation({
  args: {
    ...adminArgs,
    speciesId: v.id("species"),
    slot: v.optional(
      v.union(v.literal("wholeTree"), v.literal("bark"), v.literal("leaf")),
    ),
  },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    if (!(await ctx.db.get("species", args.speciesId))) {
      throw new ConvexError("Arten findes ikke.");
    }
    const jobId = await ctx.db.insert("jobs", {
      kind: "fetchCatalog",
      speciesId: args.speciesId,
      slot: args.slot,
      status: "queued",
    });
    await ctx.scheduler.runAfter(0, internal.pipeline.photos.fetchCatalog, {
      jobId,
    });
    return jobId;
  },
});

/** Queues an AI draft of the card; only drafts and cards needing changes. */
export const draftCard = mutation({
  args: { ...adminArgs, speciesId: v.id("species") },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const species = await ctx.db.get("species", args.speciesId);
    if (!species) throw new ConvexError("Arten findes ikke.");
    if (!(DRAFTABLE_STATUSES as readonly string[]).includes(species.status)) {
      throw new ConvexError(
        "Kun AI-udkast og kort, der skal rettes, kan skrives om.",
      );
    }
    const jobId = await ctx.db.insert("jobs", {
      kind: "draftCard",
      speciesId: args.speciesId,
      status: "queued",
    });
    await ctx.scheduler.runAfter(0, internal.pipeline.drafting.draftCard, {
      jobId,
    });
    return jobId;
  },
});
