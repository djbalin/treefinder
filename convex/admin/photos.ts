import { ConvexError, v } from "convex/values";
import { PHOTO_SLOTS } from "../../src/domain/options";
import { validatePhotoChange } from "../../src/domain/photoRules";
import { thumbnailUrl } from "../../src/lib/photoSources/filters";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "../_generated/server";
import { adminArgs, requireAdmin } from "../lib/admin";
import { assertPublishable } from "../lib/publishing";
import { license, photoSlot, photoSource, photoStatus } from "../validators";

const adminPhoto = v.object({
  id: v.id("photos"),
  speciesId: v.id("species"),
  status: photoStatus,
  slot: v.union(photoSlot, v.null()),
  source: photoSource,
  poster: v.boolean(),
  url: v.union(v.string(), v.null()),
  /** A small version for grids; the stored file once it has been copied. */
  thumbUrl: v.union(v.string(), v.null()),
  sourceUrl: v.union(v.string(), v.null()),
  stored: v.boolean(),
  author: v.string(),
  license,
  attribution: v.string(),
});

async function toAdminPhoto(ctx: QueryCtx, photo: Doc<"photos">) {
  const stored = photo.storageId
    ? await ctx.storage.getUrl(photo.storageId)
    : null;
  return {
    id: photo._id,
    speciesId: photo.speciesId,
    status: photo.status,
    slot: photo.slot ?? null,
    poster: photo.poster ?? false,
    source: photo.source,
    url: stored ?? photo.remoteUrl ?? null,
    thumbUrl:
      stored ?? (photo.remoteUrl ? thumbnailUrl(photo.remoteUrl) : null),
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
 * One species' photo catalog: for each slot, its gallery (poster first)
 * and its candidates, and whether the source has more to fetch.
 */
export const catalog = query({
  args: { ...adminArgs, speciesId: v.id("species") },
  returns: v.array(
    v.object({
      slot: photoSlot,
      selected: v.array(adminPhoto),
      candidates: v.array(adminPhoto),
      exhausted: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const bySlot = new Map<
      string,
      { selected: AdminPhoto[]; candidates: AdminPhoto[] }
    >();
    for (const status of ["selected", "candidate"] as const) {
      const photos = await ctx.db
        .query("photos")
        .withIndex("by_species_and_status", (q) =>
          q.eq("speciesId", args.speciesId).eq("status", status),
        )
        .take(1000);
      for (const photo of photos) {
        if (!photo.slot) continue;
        const group = bySlot.get(photo.slot) ?? {
          selected: [],
          candidates: [],
        };
        const item = await toAdminPhoto(ctx, photo);
        if (status === "selected") group.selected.push(item);
        else group.candidates.push(item);
        bySlot.set(photo.slot, group);
      }
    }

    const result = [];
    for (const slot of PHOTO_SLOTS) {
      const group = bySlot.get(slot) ?? { selected: [], candidates: [] };
      const cursor = await ctx.db
        .query("catalogCursors")
        .withIndex("by_species_and_slot", (q) =>
          q.eq("speciesId", args.speciesId).eq("slot", slot),
        )
        .unique();
      result.push({
        slot,
        selected: group.selected.sort(
          (a, b) => Number(b.poster) - Number(a.poster),
        ),
        candidates: group.candidates,
        exhausted: cursor?.exhausted ?? false,
      });
    }
    return result;
  },
});

type AdminPhoto = Awaited<ReturnType<typeof toAdminPhoto>>;

/**
 * Adds a photo to a slot's gallery. Other selected photos stay; a photo
 * that only links to its image is copied into storage in the background.
 */
export const select = mutation({
  args: { ...adminArgs, photoId: v.id("photos"), slot: photoSlot },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await getPhoto(ctx, args.photoId);
    const problem = validatePhotoChange({
      status: "selected",
      slot: args.slot,
    });
    if (problem) throw new Error(problem);

    const moved = photo.slot !== args.slot;
    await ctx.db.patch("photos", photo._id, {
      status: "selected",
      slot: args.slot,
      ...(moved && { poster: false }),
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
    if (moved) await checkSpecies(ctx, photo.speciesId);
    return null;
  },
});

/** Takes a photo out of its gallery, back to the candidates. */
export const unselect = mutation({
  args: { ...adminArgs, photoId: v.id("photos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await getPhoto(ctx, args.photoId);
    await ctx.db.patch("photos", photo._id, {
      status: "candidate",
      poster: false,
    });
    await checkSpecies(ctx, photo.speciesId);
    return null;
  },
});

/** Makes a selected photo its slot's poster; the slot's old poster stays in the gallery. */
export const setPoster = mutation({
  args: { ...adminArgs, photoId: v.id("photos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await getPhoto(ctx, args.photoId);
    if (photo.status !== "selected" || !photo.slot) {
      throw new ConvexError(
        "Vælg billedet til galleriet, før det kan være plakat.",
      );
    }
    const others = await ctx.db
      .query("photos")
      .withIndex("by_species_and_status", (q) =>
        q.eq("speciesId", photo.speciesId).eq("status", "selected"),
      )
      .take(1000);
    for (const other of others) {
      if (
        other.poster &&
        other.slot === photo.slot &&
        other._id !== photo._id
      ) {
        await ctx.db.patch("photos", other._id, { poster: false });
      }
    }
    await ctx.db.patch("photos", photo._id, { poster: true });
    return null;
  },
});

/** Moves a photo to another slot (for a mislabelled candidate). */
export const move = mutation({
  args: { ...adminArgs, photoId: v.id("photos"), slot: photoSlot },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await getPhoto(ctx, args.photoId);
    await ctx.db.patch("photos", photo._id, { slot: args.slot, poster: false });
    await checkSpecies(ctx, photo.speciesId);
    return null;
  },
});

/** Rejects a photo; it is hidden everywhere and never fetched again. */
export const reject = mutation({
  args: { ...adminArgs, photoId: v.id("photos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const photo = await getPhoto(ctx, args.photoId);
    await ctx.db.patch("photos", photo._id, {
      status: "rejected",
      poster: false,
    });
    await checkSpecies(ctx, photo.speciesId);
    return null;
  },
});

async function getPhoto(ctx: MutationCtx, id: Id<"photos">) {
  const photo = await ctx.db.get("photos", id);
  if (!photo) throw new ConvexError("Billedet findes ikke.");
  return photo;
}

/** A published card keeps a poster in every required slot. */
async function checkSpecies(ctx: MutationCtx, speciesId: Id<"species">) {
  const species = await ctx.db.get("species", speciesId);
  if (species) await assertPublishable(ctx, species);
}

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
