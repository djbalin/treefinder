import { v } from "convex/values";
import { fetchCommonsCandidates } from "../../src/lib/photoSources/commons";
import {
  isAllowedImageUrl,
  MAX_IMAGE_BYTES,
} from "../../src/lib/photoSources/filters";
import { fetchInaturalistCandidates } from "../../src/lib/photoSources/inaturalist";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Fetches photo candidates from Wikimedia Commons and iNaturalist for the
 * job's species. Each source is stored before the next one is asked.
 */
export const fetchPhotos = internalAction({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.pipeline.data.jobContext, args);
    if (!job) return null;
    await ctx.runMutation(internal.pipeline.data.markRunning, args);
    try {
      for (const fetchFrom of [
        fetchCommonsCandidates,
        fetchInaturalistCandidates,
      ]) {
        const candidates = await fetchFrom(job.latinName);
        await ctx.runMutation(internal.pipeline.data.storeCandidates, {
          speciesId: job.speciesId,
          candidates,
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
