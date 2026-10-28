import { v } from "convex/values";
import {
  CATALOG_SLOTS,
  type CatalogCursor,
  fetchCatalogBatch,
  firstCursor,
} from "../../src/lib/photoSources/catalog";
import {
  isAllowedImageUrl,
  MAX_IMAGE_BYTES,
} from "../../src/lib/photoSources/filters";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Fetches the next 20 catalog candidates for each of whole tree, bark and
 * leaf (or one slot), each from its source (product spec 7.4). Every slot
 * is stored with its cursor before the next one starts.
 */
export const fetchCatalog = internalAction({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.pipeline.data.jobContext, args);
    if (!job) return null;
    await ctx.runMutation(internal.pipeline.data.markRunning, args);
    try {
      const slots = CATALOG_SLOTS.filter(
        (slot) => !job.slot || job.slot === slot,
      );
      for (const slot of slots) {
        const saved = await ctx.runQuery(internal.pipeline.data.getCursor, {
          speciesId: job.speciesId,
          slot,
        });
        if (saved?.exhausted) continue;
        const cursor: CatalogCursor = saved
          ? JSON.parse(saved.cursor)
          : await firstCursor(job.latinName, slot);
        const { candidates, next } = await fetchCatalogBatch(
          job.latinName,
          cursor,
        );
        await ctx.runMutation(internal.pipeline.data.storeCandidates, {
          speciesId: job.speciesId,
          slot,
          candidates,
        });
        await ctx.runMutation(internal.pipeline.data.saveCursor, {
          speciesId: job.speciesId,
          slot,
          cursor: JSON.stringify(next ?? cursor),
          exhausted: next === null,
        });
      }
      await ctx.runMutation(internal.pipeline.data.markFinished, args);
    } catch (error) {
      await ctx.runMutation(internal.pipeline.data.markFinished, {
        ...args,
        error: errorMessage(error),
      });
    }
    return null;
  },
});

/**
 * Copies a selected photo into Convex storage, so published photos never
 * depend on another site. Only known image hosts over https.
 */
export const storePhoto = internalAction({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.pipeline.data.jobContext, args);
    const photo = job?.photo;
    if (!photo || photo.stored || !photo.remoteUrl) {
      await ctx.runMutation(internal.pipeline.data.markFinished, args);
      return null;
    }
    await ctx.runMutation(internal.pipeline.data.markRunning, args);
    try {
      if (!isAllowedImageUrl(photo.remoteUrl)) {
        throw new Error(`Billedet må ikke hentes fra ${photo.remoteUrl}.`);
      }
      const response = await fetch(photo.remoteUrl);
      const type = response.headers.get("content-type")?.split(";")[0] ?? "";
      if (!response.ok || !type.startsWith("image/")) {
        throw new Error(`Kunne ikke hente billedet (${response.status}).`);
      }
      const blob = await response.blob();
      if (blob.size > MAX_IMAGE_BYTES) {
        throw new Error("Billedet er for stort.");
      }
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.pipeline.data.attachStorage, {
        photoId: photo.id,
        storageId,
      });
      await ctx.runMutation(internal.pipeline.data.markFinished, args);
    } catch (error) {
      await ctx.runMutation(internal.pipeline.data.markFinished, {
        ...args,
        error: errorMessage(error),
      });
    }
    return null;
  },
});

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
