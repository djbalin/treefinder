import { v } from "convex/values";
import { describeBlockers } from "../../src/domain/publishRules";
import type { Doc, Id } from "../_generated/dataModel";
import { type MutationCtx, mutation, query } from "../_generated/server";
import { adminArgs, requireAdmin } from "../lib/admin";
import type { Localized } from "../lib/localize";
import { assertPublishable, publishBlockers } from "../lib/publishing";
import schema from "../schema";
import {
  cardStatus,
  difficulty,
  filterTraits,
  hardness,
  launchWave,
  source,
  use,
} from "../validators";

/** Far above the roughly 40 species the product will ever hold. */
const MAX_SPECIES = 500;

/** Every species with its status and photo progress, for the admin list. */
export const list = query({
  args: adminArgs,
  returns: v.array(
    v.object({
      id: v.id("species"),
      slug: v.string(),
      name: v.string(),
      latinName: v.string(),
      status: cardStatus,
      launchWave,
      isWarning: v.boolean(),
      selectedSlots: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const species = await ctx.db.query("species").take(MAX_SPECIES);
    const rows = [];
    for (const item of species) {
      const selected = await ctx.db
        .query("photos")
        .withIndex("by_species_and_status", (q) =>
          q.eq("speciesId", item._id).eq("status", "selected"),
        )
        .take(10);
      rows.push({
        id: item._id,
        slug: item.slug,
        name: item.name.da,
        latinName: item.latinName,
        status: item.status,
        launchWave: item.launchWave,
        isWarning: item.isWarning,
        selectedSlots: selected.length,
      });
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name, "da"));
  },
});

/** One species for the editor, with what stops it from being published. */
export const get = query({
  args: { ...adminArgs, id: v.id("species") },
  returns: v.union(
    v.object({
      species: schema.tables.species.validator.extend({
        _id: v.id("species"),
        _creationTime: v.number(),
      }),
      blockers: v.array(v.string()),
      jobs: v.array(
        v.object({
          id: v.id("jobs"),
          kind: v.string(),
          status: v.string(),
          error: v.union(v.string(), v.null()),
          finishedAt: v.union(v.number(), v.null()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const species = await ctx.db.get("species", args.id);
    if (!species) return null;
    const blockers = (await publishBlockers(ctx, species)).map((blocker) =>
      describeBlockers([blocker]),
    );
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_species", (q) => q.eq("speciesId", args.id))
      .order("desc")
      .take(5);
    return {
      species,
      blockers,
      jobs: jobs.map((job) => ({
        id: job._id,
        kind: job.kind,
        status: job.status,
        error: job.error ?? null,
        finishedAt: job.finishedAt ?? null,
      })),
    };
  },
});

/** The Danish card fields the editor saves. Empty text clears a field. */
export const cardInput = v.object({
  name: v.string(),
  latinName: v.string(),
  isWarning: v.boolean(),
  warningReason: v.string(),
  greenCarving: v.union(difficulty, v.null()),
  dryHardness: v.union(hardness, v.null()),
  jankaN: v.union(v.number(), v.null()),
  grainTexture: v.string(),
  colourSmell: v.string(),
  goodForTags: v.array(use),
  goodFor: v.string(),
  riving: v.string(),
  drying: v.string(),
  foodSafety: v.string(),
  foodSafetyChecked: v.boolean(),
  idFeatures: v.object({
    leaf: v.string(),
    bark: v.string(),
    twig: v.string(),
    shape: v.string(),
    cutWood: v.string(),
  }),
  filterTraits,
  sources: v.array(source),
  launchWave,
  reviewNotes: v.string(),
});

/** Saves the editor's Danish card fields; English text is kept. */
export const save = mutation({
  args: { ...adminArgs, id: v.id("species"), card: cardInput },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const current = await ctx.db.get("species", args.id);
    if (!current) throw new Error("Arten findes ikke.");
    await saveRevision(ctx, current, "edit");

    const { card } = args;
    const features = current.idFeatures ?? {};
    const name = withDanish(current.name, card.name);
    await ctx.db.patch("species", args.id, {
      name: name ?? current.name,
      latinName: card.latinName.trim() || current.latinName,
      isWarning: card.isWarning,
      warningReason: withDanish(current.warningReason, card.warningReason),
      greenCarving: card.greenCarving ?? undefined,
      dryHardness: card.dryHardness ?? undefined,
      jankaN: card.jankaN ?? undefined,
      grainTexture: withDanish(current.grainTexture, card.grainTexture),
      colourSmell: withDanish(current.colourSmell, card.colourSmell),
      goodForTags: card.goodForTags,
      goodFor: withDanish(current.goodFor, card.goodFor),
      riving: withDanish(current.riving, card.riving),
      drying: withDanish(current.drying, card.drying),
      foodSafety: withDanish(current.foodSafety, card.foodSafety),
      foodSafetyChecked: card.foodSafetyChecked,
      foodSafetyCheckedAt: card.foodSafetyChecked
        ? (current.foodSafetyCheckedAt ?? Date.now())
        : undefined,
      idFeatures: {
        leaf: withDanish(features.leaf, card.idFeatures.leaf),
        bark: withDanish(features.bark, card.idFeatures.bark),
        twig: withDanish(features.twig, card.idFeatures.twig),
        shape: withDanish(features.shape, card.idFeatures.shape),
        cutWood: withDanish(features.cutWood, card.idFeatures.cutWood),
      },
      filterTraits: card.filterTraits,
      sources: card.sources,
      launchWave: card.launchWave,
      reviewNotes: card.reviewNotes.trim() || undefined,
    });

    const updated = await ctx.db.get("species", args.id);
    if (updated) await assertPublishable(ctx, updated);
    return null;
  },
});

/** Moves a card through its states; publishing checks every publish rule. */
export const setStatus = mutation({
  args: { ...adminArgs, id: v.id("species"), status: cardStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const current = await ctx.db.get("species", args.id);
    if (!current) throw new Error("Arten findes ikke.");
    await assertPublishable(ctx, { ...current, status: args.status });
    await ctx.db.patch("species", args.id, { status: args.status });
    return null;
  },
});

/** Keeps the card's text before a change (architecture.md §3). */
export async function saveRevision(
  ctx: MutationCtx,
  species: Doc<"species">,
  reason: "draft" | "edit",
): Promise<Id<"speciesRevisions">> {
  const { _id, _creationTime, ...card } = species;
  return ctx.db.insert("speciesRevisions", {
    speciesId: _id,
    reason,
    snapshot: JSON.stringify(card),
  });
}

/**
 * Replaces the Danish text of a localized field, keeping any English. Empty
 * Danish text without English clears the field.
 */
function withDanish(
  current: Localized | undefined,
  danish: string,
): Localized | undefined {
  const text = danish.trim();
  if (!text && !current?.en) return undefined;
  return { ...current, da: text };
}
