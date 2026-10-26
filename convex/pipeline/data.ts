import { v } from "convex/values";
import { DRAFTABLE_STATUSES } from "../../src/domain/drafting";
import type { DraftUpdate } from "../../src/lib/drafting/submission";
import { newCandidates } from "../../src/lib/photoSources/filters";
import { internalMutation, internalQuery } from "../_generated/server";
import { saveRevision } from "../admin/species";
import type { Localized } from "../lib/localize";
import { license, photoSlot } from "../validators";

/*
 * Database steps for the background jobs. Actions have no database access,
 * so each step is a small internal query or mutation, stored before the
 * next step starts.
 */

/** The job and the species it works on. */
export const jobContext = internalQuery({
  args: { jobId: v.id("jobs") },
  returns: v.union(
    v.object({
      speciesId: v.id("species"),
      latinName: v.string(),
      name: v.string(),
      isWarning: v.boolean(),
      draftable: v.boolean(),
      photo: v.union(
        v.object({
          id: v.id("photos"),
          remoteUrl: v.union(v.string(), v.null()),
          stored: v.boolean(),
        }),
        v.null(),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) return null;
    const species = await ctx.db.get("species", job.speciesId);
    if (!species) return null;
    const photo = job.photoId ? await ctx.db.get("photos", job.photoId) : null;
    return {
      speciesId: species._id,
      latinName: species.latinName,
      name: species.name.da,
      isWarning: species.isWarning,
      draftable: (DRAFTABLE_STATUSES as readonly string[]).includes(
        species.status,
      ),
      photo: photo
        ? {
            id: photo._id,
            remoteUrl: photo.remoteUrl ?? null,
            stored: Boolean(photo.storageId),
          }
        : null,
    };
  },
});

export const markRunning = internalMutation({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("jobs", args.jobId, {
      status: "running",
      startedAt: Date.now(),
    });
    return null;
  },
});

export const markFinished = internalMutation({
  args: { jobId: v.id("jobs"), error: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("jobs", args.jobId, {
      status: args.error ? "failed" : "done",
      error: args.error,
      finishedAt: Date.now(),
    });
    return null;
  },
});

const candidate = v.object({
  source: v.union(v.literal("commons"), v.literal("inaturalist")),
  sourceUrl: v.string(),
  remoteUrl: v.string(),
  author: v.string(),
  license,
  attribution: v.string(),
  slotHint: v.optional(photoSlot),
});

/** Stores new photo candidates, skipping any the species already has. */
export const storeCandidates = internalMutation({
  args: { speciesId: v.id("species"), candidates: v.array(candidate) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = [];
    for (const status of ["candidate", "selected", "rejected"] as const) {
      existing.push(
        ...(await ctx.db
          .query("photos")
          .withIndex("by_species_and_status", (q) =>
            q.eq("speciesId", args.speciesId).eq("status", status),
          )
          .take(500)),
      );
    }
    const fresh = newCandidates(args.candidates, existing);
    for (const item of fresh) {
      await ctx.db.insert("photos", {
        speciesId: args.speciesId,
        status: "candidate",
        slot: item.slotHint,
        source: item.source,
        sourceUrl: item.sourceUrl,
        remoteUrl: item.remoteUrl,
        author: item.author,
        license: item.license,
        attribution: item.attribution,
        fetchedAt: Date.now(),
      });
    }
    return fresh.length;
  },
});

export const attachStorage = internalMutation({
  args: { photoId: v.id("photos"), storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("photos", args.photoId, { storageId: args.storageId });
    return null;
  },
});

/** Keeps the card's text before an AI draft overwrites it. */
export const saveDraftRevision = internalMutation({
  args: { speciesId: v.id("species") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const species = await ctx.db.get("species", args.speciesId);
    if (species) await saveRevision(ctx, species, "draft");
    return null;
  },
});

/**
 * Writes one drafted section into the Danish card. The update was built and
 * checked by buildDraftUpdate; approved and published cards are left alone.
 */
export const applyDraft = internalMutation({
  args: { speciesId: v.id("species"), updateJson: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const species = await ctx.db.get("species", args.speciesId);
    if (
      !species ||
      !(DRAFTABLE_STATUSES as readonly string[]).includes(species.status)
    ) {
      return false;
    }
    const update = JSON.parse(args.updateJson) as DraftUpdate;
    const da = (
      current: Localized | undefined,
      text: string | null | undefined,
    ) =>
      text === undefined
        ? current
        : text
          ? { ...current, da: text }
          : current?.en
            ? { ...current, da: "" }
            : undefined;
    const features = species.idFeatures ?? {};

    await ctx.db.patch("species", species._id, {
      status: "aiDraft",
      sources: update.sources,
      ...("greenCarving" in update && {
        greenCarving: update.greenCarving ?? undefined,
        dryHardness: update.dryHardness ?? undefined,
        jankaN: update.jankaN ?? undefined,
        grainTexture: da(species.grainTexture, update.grainTexture),
        colourSmell: da(species.colourSmell, update.colourSmell),
        goodForTags: update.goodForTags,
        goodFor: da(species.goodFor, update.goodFor),
        riving: da(species.riving, update.riving),
        drying: da(species.drying, update.drying),
      }),
      ...("foodSafety" in update && {
        foodSafety: da(species.foodSafety, update.foodSafety),
        isWarning: update.isWarning,
        warningReason: da(species.warningReason, update.warningReason),
      }),
      ...(update.idFeatures && {
        idFeatures: {
          leaf: da(features.leaf, update.idFeatures.leaf),
          bark: da(features.bark, update.idFeatures.bark),
          twig: da(features.twig, update.idFeatures.twig),
          shape: da(features.shape, update.idFeatures.shape),
          cutWood: da(features.cutWood, update.idFeatures.cutWood),
        },
        filterTraits: update.filterTraits,
        localNames: update.localNames,
      }),
    });
    return true;
  },
});

/** The current card fields a draft builds on. */
export const draftContext = internalQuery({
  args: { speciesId: v.id("species") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const species = await ctx.db.get("species", args.speciesId);
    return JSON.stringify({
      sources: species?.sources ?? [],
      isWarning: species?.isWarning ?? false,
      localNames: { da: species?.localNames?.da ?? [] },
    });
  },
});
