import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  cardStatus,
  difficulty,
  filterTraits,
  hardness,
  idFeatures,
  jobKind,
  jobStatus,
  launchWave,
  license,
  localized,
  localNames,
  photoSlot,
  photoSource,
  photoStatus,
  source,
  use,
} from "./validators";

/** The data model from specs/architecture.md §3. */
export default defineSchema({
  species: defineTable({
    slug: v.string(),
    name: localized,
    latinName: v.string(),
    localNames: v.optional(localNames),
    isWarning: v.boolean(),
    warningReason: v.optional(localized),
    greenCarving: v.optional(difficulty),
    dryHardness: v.optional(hardness),
    jankaN: v.optional(v.number()),
    grainTexture: v.optional(localized),
    colourSmell: v.optional(localized),
    goodForTags: v.optional(v.array(use)),
    goodFor: v.optional(localized),
    riving: v.optional(localized),
    drying: v.optional(localized),
    foodSafety: v.optional(localized),
    foodSafetyChecked: v.optional(v.boolean()),
    foodSafetyCheckedAt: v.optional(v.number()),
    idFeatures: v.optional(idFeatures),
    lookAlikes: v.optional(v.array(v.id("species"))),
    filterTraits: v.optional(filterTraits),
    sources: v.optional(v.array(source)),
    status: cardStatus,
    launchWave: launchWave,
    reviewNotes: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  speciesRevisions: defineTable({
    speciesId: v.id("species"),
    reason: v.union(v.literal("draft"), v.literal("edit")),
    /** The card fields before the change, as JSON. */
    snapshot: v.string(),
  }).index("by_species", ["speciesId"]),

  photos: defineTable({
    speciesId: v.id("species"),
    slot: v.optional(photoSlot),
    status: photoStatus,
    source: photoSource,
    sourceUrl: v.optional(v.string()),
    remoteUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    author: v.string(),
    license: license,
    attribution: v.string(),
    alt: v.optional(localized),
    fetchedAt: v.optional(v.number()),
  })
    .index("by_species_and_status", ["speciesId", "status"])
    .index("by_species_and_source_url", ["speciesId", "sourceUrl"])
    .index("by_status", ["status"]),

  pages: defineTable({
    slug: v.union(v.literal("about"), v.literal("whereToGetWood")),
    title: localized,
    content: localized,
  }).index("by_slug", ["slug"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.literal("admin"),
  }).index("by_token", ["tokenIdentifier"]),

  jobs: defineTable({
    kind: jobKind,
    speciesId: v.id("species"),
    photoId: v.optional(v.id("photos")),
    status: jobStatus,
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  }).index("by_species", ["speciesId"]),
});
