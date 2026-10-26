import type { Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { type Locale, pick } from "./lib/localize";
import type { publicPhoto } from "./returns";

/** The most selected photos a species can have: one per slot. */
const MAX_SELECTED = 5;

export type PublicPhoto = Infer<typeof publicPhoto>;

/**
 * A species' selected photos, ready for visitors: stored photos are served
 * from Convex file storage, and a selected photo whose file has not been
 * copied yet falls back to its remote URL.
 */
export async function selectedPhotos(
  ctx: QueryCtx,
  speciesId: Id<"species">,
  locale: Locale,
): Promise<PublicPhoto[]> {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_species_and_status", (q) =>
      q.eq("speciesId", speciesId).eq("status", "selected"),
    )
    .take(MAX_SELECTED);

  const result: PublicPhoto[] = [];
  for (const photo of photos) {
    const url = photo.storageId
      ? await ctx.storage.getUrl(photo.storageId)
      : (photo.remoteUrl ?? null);
    if (!url) continue;
    result.push({
      id: photo._id,
      slot: photo.slot ?? null,
      url,
      alt: pick(photo.alt, locale),
      author: photo.author,
      license: photo.license,
      attribution: photo.attribution,
      sourceUrl: photo.sourceUrl ?? null,
    });
  }
  return result;
}
