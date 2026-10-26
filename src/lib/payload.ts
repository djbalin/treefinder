import config from "@payload-config";
import { getPayload } from "payload";
import type { PhotoSlot } from "@/domain/options";
import type { AppLocale } from "@/i18n/routing";
import type { Photo, Species } from "@/payload-types";

export async function payloadClient() {
  return getPayload({ config });
}

/**
 * Public reads run with visitor access (`overrideAccess: false`), so only
 * published species and selected photos ever reach a page.
 */
const visitor = { overrideAccess: false } as const;

export async function getPublishedSpecies(
  locale: AppLocale,
): Promise<Species[]> {
  const payload = await payloadClient();
  const result = await payload.find({
    ...visitor,
    collection: "species",
    locale,
    depth: 0,
    pagination: false,
    sort: "name",
  });
  return result.docs;
}

export async function getSpeciesBySlug(
  slug: string,
  locale: AppLocale,
): Promise<Species | null> {
  const payload = await payloadClient();
  const result = await payload.find({
    ...visitor,
    collection: "species",
    locale,
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getSelectedPhotos(
  speciesIds: number[],
  locale: AppLocale,
): Promise<Photo[]> {
  if (speciesIds.length === 0) return [];
  const payload = await payloadClient();
  const result = await payload.find({
    ...visitor,
    collection: "photos",
    locale,
    where: { species: { in: speciesIds } },
    depth: 0,
    pagination: false,
  });
  return result.docs;
}

/** Selected photos keyed by slot, for one species. */
export function photosBySlot(
  photos: Photo[],
  speciesId: number,
): Partial<Record<PhotoSlot, Photo>> {
  const bySlot: Partial<Record<PhotoSlot, Photo>> = {};
  for (const photo of photos) {
    const owner =
      typeof photo.species === "object" ? photo.species.id : photo.species;
    if (owner === speciesId && photo.slot) bySlot[photo.slot] = photo;
  }
  return bySlot;
}

export async function getPage(
  slug: "whereToGetWood" | "about",
  locale: AppLocale,
) {
  const payload = await payloadClient();
  return payload.findGlobal({ ...visitor, slug, locale, depth: 0 });
}

/** Every local name of a species, flattened for search. */
export function allLocalNames(species: Species): string[] {
  const names = species.localNames ?? {};
  return Object.values(names).flatMap((value) =>
    Array.isArray(value) ? value : [],
  );
}
