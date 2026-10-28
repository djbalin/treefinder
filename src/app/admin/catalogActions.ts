"use server";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { PHOTO_SLOTS, type PhotoSlot } from "@/domain/options";
import { adminMutation } from "@/lib/admin/convex";

/*
 * Catalog actions called from the client grid. They return an error
 * message instead of redirecting, so the grid keeps its place and focus;
 * the grid refreshes itself afterwards.
 */

export type CatalogResult = { error: string | null };

async function attempt(work: () => Promise<unknown>): Promise<CatalogResult> {
  try {
    await work();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof ConvexError
          ? String(error.data)
          : error instanceof Error
            ? error.message
            : String(error),
    };
  }
}

export async function selectForGallery(
  photoId: Id<"photos">,
  slot: PhotoSlot,
): Promise<CatalogResult> {
  if (!PHOTO_SLOTS.includes(slot)) return { error: "Ukendt plads." };
  return attempt(() =>
    adminMutation(api.admin.photos.select, { photoId, slot }),
  );
}

export async function removeFromGallery(
  photoId: Id<"photos">,
): Promise<CatalogResult> {
  return attempt(() => adminMutation(api.admin.photos.unselect, { photoId }));
}

export async function makePoster(
  photoId: Id<"photos">,
): Promise<CatalogResult> {
  return attempt(() => adminMutation(api.admin.photos.setPoster, { photoId }));
}

export async function moveToSlot(
  photoId: Id<"photos">,
  slot: PhotoSlot,
): Promise<CatalogResult> {
  if (!PHOTO_SLOTS.includes(slot)) return { error: "Ukendt plads." };
  return attempt(() => adminMutation(api.admin.photos.move, { photoId, slot }));
}

export async function rejectFromCatalog(
  photoId: Id<"photos">,
): Promise<CatalogResult> {
  return attempt(() => adminMutation(api.admin.photos.reject, { photoId }));
}
