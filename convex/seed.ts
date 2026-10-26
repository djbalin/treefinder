import { v } from "convex/values";
import { parseSpeciesTable, type SpeciesSeed } from "../src/domain/speciesList";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { PAGE_SEEDS } from "./seedData";

/**
 * Seeds the species list from specs/species.md and the static pages.
 * Idempotent: existing species keep their card content, existing pages are
 * left alone. Run with `pnpm seed:convex`.
 */
export const run = internalMutation({
  args: { speciesMarkdown: v.string() },
  returns: v.object({
    species: v.number(),
    created: v.number(),
    pages: v.number(),
  }),
  handler: async (ctx, args) => {
    const seeds = parseSpeciesTable(args.speciesMarkdown);
    const ids = new Map<string, Id<"species">>();
    let created = 0;

    for (const seed of seeds) {
      const { id, isNew } = await upsertSpecies(ctx, seed);
      ids.set(seed.slug, id);
      if (isNew) created++;
    }
    await linkLookAlikes(ctx, seeds, ids);

    let pages = 0;
    for (const page of PAGE_SEEDS) {
      const existing = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", page.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("pages", {
        slug: page.slug,
        title: { ...page.title },
        content: { da: page.content },
      });
      pages++;
    }

    return { species: seeds.length, created, pages };
  },
});

async function upsertSpecies(
  ctx: MutationCtx,
  seed: SpeciesSeed,
): Promise<{ id: Id<"species">; isNew: boolean }> {
  const existing = await ctx.db
    .query("species")
    .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
    .unique();

  if (existing) {
    await ctx.db.patch("species", existing._id, {
      latinName: seed.latinName,
      launchWave: seed.launchWave,
      isWarning: seed.isWarning,
      name: { ...existing.name, en: seed.nameEn },
      localNames: {
        ...existing.localNames,
        da: [seed.nameDa],
        en: [seed.nameEn],
      },
    });
    return { id: existing._id, isNew: false };
  }

  const id = await ctx.db.insert("species", {
    slug: seed.slug,
    name: { da: seed.nameDa, en: seed.nameEn },
    latinName: seed.latinName,
    localNames: { da: [seed.nameDa], en: [seed.nameEn] },
    isWarning: seed.isWarning,
    launchWave: seed.launchWave,
    status: "aiDraft",
  });
  return { id, isNew: true };
}

/** Look-alikes from the spec's notes, linked both ways. */
async function linkLookAlikes(
  ctx: MutationCtx,
  seeds: SpeciesSeed[],
  ids: Map<string, Id<"species">>,
) {
  const byEnglishName = new Map(
    seeds.map((seed) => [seed.nameEn.toLowerCase(), seed.slug]),
  );

  for (const seed of seeds) {
    if (!seed.lookAlikeOf) continue;
    const otherSlug = byEnglishName.get(seed.lookAlikeOf.toLowerCase());
    const id = ids.get(seed.slug);
    const otherId = otherSlug ? ids.get(otherSlug) : undefined;
    if (!id || !otherId) {
      throw new Error(
        `Unknown look-alike "${seed.lookAlikeOf}" for ${seed.slug}.`,
      );
    }
    await addLookAlike(ctx, id, otherId);
    await addLookAlike(ctx, otherId, id);
  }
}

async function addLookAlike(
  ctx: MutationCtx,
  id: Id<"species">,
  otherId: Id<"species">,
) {
  const doc = await ctx.db.get("species", id);
  if (!doc) return;
  const current = doc.lookAlikes ?? [];
  if (current.includes(otherId)) return;
  await ctx.db.patch("species", id, { lookAlikes: [...current, otherId] });
}
