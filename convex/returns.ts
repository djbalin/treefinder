import { v } from "convex/values";
import {
  difficulty,
  filterTraits,
  hardness,
  license,
  localNames,
  photoSlot,
  source,
  use,
} from "./validators";

/*
 * Return validators for the public queries. They are also the contract for
 * what a visitor can ever see: nothing outside these shapes leaves Convex.
 */

export const publicPhoto = v.object({
  id: v.id("photos"),
  slot: v.union(photoSlot, v.null()),
  poster: v.boolean(),
  url: v.string(),
  alt: v.union(v.string(), v.null()),
  author: v.string(),
  license,
  attribution: v.string(),
  sourceUrl: v.union(v.string(), v.null()),
});

const summaryFields = {
  id: v.id("species"),
  slug: v.string(),
  name: v.string(),
  latinName: v.string(),
  localNames,
  isWarning: v.boolean(),
  greenCarving: v.union(difficulty, v.null()),
  dryHardness: v.union(hardness, v.null()),
  foodSafetyChecked: v.boolean(),
  goodForTags: v.array(use),
  filterTraits,
};

const text = v.union(v.string(), v.null());

export const speciesSummary = v.object(summaryFields);

export const speciesListItem = v.object({
  ...summaryFields,
  photos: v.array(publicPhoto),
});

export const speciesCard = v.object({
  ...summaryFields,
  warningReason: text,
  jankaN: v.union(v.number(), v.null()),
  grainTexture: text,
  colourSmell: text,
  goodFor: text,
  riving: text,
  drying: text,
  foodSafety: text,
  foodSafetyCheckedAt: v.union(v.number(), v.null()),
  idFeatures: v.object({
    leaf: text,
    bark: text,
    twig: text,
    shape: text,
    cutWood: text,
  }),
  sources: v.array(source),
  photos: v.array(publicPhoto),
  lookAlikes: v.array(speciesSummary),
});

export const publicPage = v.object({
  title: text,
  content: text,
});
