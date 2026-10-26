import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { type Locale, pick } from "./lib/localize";
import { type PublicPhoto, selectedPhotos } from "./photos";
import { speciesCard, speciesListItem } from "./returns";
import { locale } from "./validators";

/** Far above the roughly 40 species the product will ever hold. */
const MAX_SPECIES = 500;

/** Every published species with its selected photos, for the home page and the list. */
export const listPublished = query({
  args: { locale },
  returns: v.array(speciesListItem),
  handler: async (ctx, args) => {
    const species = await ctx.db
      .query("species")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(MAX_SPECIES);

    return await Promise.all(
      species.map(async (item) => ({
        ...summary(item, args.locale),
        photos: await selectedPhotos(ctx, item._id, args.locale),
      })),
    );
  },
});

/** One published species' card, or null when it is missing or unpublished. */
export const getPublishedBySlug = query({
  args: { slug: v.string(), locale },
  returns: v.union(speciesCard, v.null()),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("species")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (item?.status !== "published") return null;

    const lookAlikes = [];
    for (const id of item.lookAlikes ?? []) {
      const other = await ctx.db.get("species", id);
      if (other?.status === "published") {
        lookAlikes.push(summary(other, args.locale));
      }
    }

    return {
      ...card(item, args.locale),
      photos: await selectedPhotos(ctx, item._id, args.locale),
      lookAlikes,
    };
  },
});

export type SpeciesSummary = ReturnType<typeof summary> & {
  photos: PublicPhoto[];
};

/** The fields lists, search and the filter key need. */
function summary(item: Doc<"species">, locale: Locale) {
  return {
    id: item._id,
    slug: item.slug,
    name: pick(item.name, locale) ?? item.slug,
    latinName: item.latinName,
    localNames: item.localNames ?? {},
    isWarning: item.isWarning,
    greenCarving: item.greenCarving ?? null,
    dryHardness: item.dryHardness ?? null,
    foodSafetyChecked: item.foodSafetyChecked ?? false,
    goodForTags: item.goodForTags ?? [],
    filterTraits: item.filterTraits ?? {},
  };
}

/** The full card in one locale. */
function card(item: Doc<"species">, locale: Locale) {
  const features = item.idFeatures ?? {};
  return {
    ...summary(item, locale),
    warningReason: pick(item.warningReason, locale),
    jankaN: item.jankaN ?? null,
    grainTexture: pick(item.grainTexture, locale),
    colourSmell: pick(item.colourSmell, locale),
    goodFor: pick(item.goodFor, locale),
    riving: pick(item.riving, locale),
    drying: pick(item.drying, locale),
    foodSafety: pick(item.foodSafety, locale),
    foodSafetyCheckedAt: item.foodSafetyCheckedAt ?? null,
    idFeatures: {
      leaf: pick(features.leaf, locale),
      bark: pick(features.bark, locale),
      twig: pick(features.twig, locale),
      shape: pick(features.shape, locale),
      cutWood: pick(features.cutWood, locale),
    },
    sources: item.sources ?? [],
  };
}
