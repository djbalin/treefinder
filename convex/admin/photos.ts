import { v } from "convex/values";
import {
  photosToDemote,
  validatePhotoChange,
} from "../../src/domain/photoRules";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { mutation, type QueryCtx, query } from "../_generated/server";
import { adminArgs, requireAdmin } from "../lib/admin";
import { assertPublishable } from "../lib/publishing";
import { license, photoSlot, photoSource, photoStatus } from "../validators";

const adminPhoto = v.object({
  id: v.id("photos"),
  speciesId: v.id("species"),
  status: photoStatus,
  slot: v.union(photoSlot, v.null()),
  source: photoSource,
  url: v.union(v.string(), v.null()),
  sourceUrl: v.union(v.string(), v.null()),
  stored: v.boolean(),
  author: v.string(),
  license,
  attribution: v.string(),
});

async function toAdminPhoto(ctx: QueryCtx, photo: Doc<"photos">) {
  return {
    id: photo._id,
    speciesId: photo.speciesId,
    status: photo.status,
    slot: photo.slot ?? null,
    source: photo.source,
    url: photo.storageId
      ? await ctx.storage.getUrl(photo.storageId)
      : (photo.remoteUrl ?? null),
    sourceUrl: photo.sourceUrl ?? null,
    stored: Boolean(photo.storageId),
    author: photo.author,
    license: photo.license,
    attribution: photo.attribution,
  };
}

/** Every photo of one species except rejected ones, for the editor. */
export const forSpecies = query({
  args: { ...adminArgs, speciesId: v.id("species") },
  returns: v.array(adminPhoto),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const result = [];
    for (const status of ["selected", "candidate"] as const) {
      const photos = await ctx.db
        .query("photos")
        .withIndex("by_species_and_status", (q) =>
          q.eq("speciesId", args.speciesId).eq("status", status),
        )
        .take(100);
      for (const photo of photos) result.push(await toAdminPhoto(ctx, photo));
    }
    return result;
  },
});

/**
 * The review queue (product spec §7.5): drafted cards waiting for review,
 * oldest first, and photo candidates grouped by species.
 */
export const reviewQueue = query({
  args: adminArgs,
  returns: v.object({
    cards: v.array(
      v.object({
        id: v.id("species"),
        name: v.string(),
        status: v.union(v.literal("aiDraft"), v.literal("needsChanges")),
      }),
    ),
    candidates: v.array(
      v.object({
        speciesId: v.id("species"),
        speciesName: v.string(),
        photos: v.array(adminPhoto),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);

    const cards = [];
    for (const status of ["aiDraft", "needsChanges"] as const) {
      const species = await ctx.db
        .query("species")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(200);
      for (const item of species) {
        // Only cards a draft or an edit has written something into.
        if (!item.foodSafety && !item.grainTexture) continue;
        cards.push({ id: item._id, name: item.name.da, status });
      }
    }

    const candidates = await ctx.db
      .query("photos")
      .withIndex("by_status", (q) => q.eq("status", "candidate"))
      .take(200);
    const groups = new Map<
      string,
      {
        speciesId: Doc<"species">["_id"];
        speciesName: string;
        photos: Awaited<ReturnType<typeof toAdminPhoto>>[];
      }
    >();
    for (const photo of candidates) {
      let group = groups.get(photo.speciesId);
      if (!group) {
        const species = await ctx.db.get("species", photo.speciesId);
        group = {
          speciesId: photo.speciesId,
          speciesName: species?.name.da ?? "?",
          photos: [],
        };
        groups.set(photo.speciesId, group);
      }
      group.photos.push(await toAdminPhoto(ctx, photo));
    }

    return { cards, candidates: [...groups.values()] };
  },
});

/**
 * Selects a photo for a slot. The previously selected photo in that slot
 * goes back to candidate, and a photo that only links to its image is
 * copied into storage in the background.
 */
export const select = mutation({
  args: { ...adminArgs, photoId: v.id("photos"), slot: photoSlot },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await ctx.db.get("photos", args.photoId);
    if (!photo) throw new Error("Billedet findes ikke.");
    const problem = validatePhotoChange({
      status: "selected",
      slot: args.slot,
    });
    if (problem) throw new Error(problem);

    const sameSpecies = await ctx.db
      .query("photos")
      .withIndex("by_species_and_status", (q) =>
        q.eq("speciesId", photo.speciesId).eq("status", "selected"),
      )
      .take(10);
    const demote = photosToDemote(
      { id: photo._id, slot: args.slot },
      sameSpecies.map((other) => ({
        id: other._id,
        status: other.status,
        slot: other.slot,
      })),
    );
    for (const id of demote) {
      const other = sameSpecies.find((item) => item._id === id);
      if (other)
        await ctx.db.patch("photos", other._id, { status: "candidate" });
    }
    await ctx.db.patch("photos", photo._id, {
      status: "selected",
      slot: args.slot,
    });

    if (!photo.storageId && photo.remoteUrl) {
      const jobId = await ctx.db.insert("jobs", {
        kind: "storePhoto",
        speciesId: photo.speciesId,
        photoId: photo._id,
        status: "queued",
      });
      await ctx.scheduler.runAfter(0, internal.pipeline.photos.storePhoto, {
        jobId,
      });
    }
    return null;
  },
});

/** Rejects a photo; a published card keeps every required photo. */
export const reject = mutation({
  args: { ...adminArgs, photoId: v.id("photos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await ctx.db.get("photos", args.photoId);
    if (!photo) throw new Error("Billedet findes ikke.");
    await ctx.db.patch("photos", photo._id, { status: "rejected" });
    const species = await ctx.db.get("species", photo.speciesId);
    if (species) await assertPublishable(ctx, species);
    return null;
  },
});

/** A one-time URL the server posts an own photo to. */
export const generateUploadUrl = mutation({
  args: adminArgs,
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Adds the admin's own uploaded photo as a candidate for a slot. */
export const addUpload = mutation({
  args: {
    ...adminArgs,
    speciesId: v.id("species"),
    storageId: v.id("_storage"),
    slot: photoSlot,
    author: v.string(),
  },
  returns: v.id("photos"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const author = args.author.trim() || "Treefinder";
    return await ctx.db.insert("photos", {
      speciesId: args.speciesId,
      status: "candidate",
      slot: args.slot,
      source: "upload",
      storageId: args.storageId,
      author,
      license: "own",
      attribution: author,
      fetchedAt: Date.now(),
    });
  },
});
