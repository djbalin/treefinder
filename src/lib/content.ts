import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import type { PhotoSlot } from "@/domain/options";
import type { AppLocale } from "@/i18n/routing";

/*
 * Server-side reads for the public site. The Convex queries only ever
 * return published species, their selected photos and the pages, so
 * nothing else can reach a page.
 */

export type SpeciesListItem = FunctionReturnType<
  typeof api.species.listPublished
>[number];
export type SpeciesCard = NonNullable<
  FunctionReturnType<typeof api.species.getPublishedBySlug>
>;
export type PublicPhoto = SpeciesListItem["photos"][number];
export type Source = SpeciesCard["sources"][number];

/** Published species, sorted by name in the given locale. */
export async function getPublishedSpecies(
  locale: AppLocale,
): Promise<SpeciesListItem[]> {
  const species = await fetchQuery(api.species.listPublished, { locale });
  return species.sort((a, b) => a.name.localeCompare(b.name, locale));
}

export async function getSpeciesBySlug(
  slug: string,
  locale: AppLocale,
): Promise<SpeciesCard | null> {
  return fetchQuery(api.species.getPublishedBySlug, { slug, locale });
}

export async function getPage(
  slug: "whereToGetWood" | "about",
  locale: AppLocale,
) {
  return fetchQuery(api.pages.get, { slug, locale });
}

/** Each slot's poster photo (or its first selected photo, if none is starred). */
export function photosBySlot(
  photos: readonly PublicPhoto[],
): Partial<Record<PhotoSlot, PublicPhoto>> {
  const bySlot: Partial<Record<PhotoSlot, PublicPhoto>> = {};
  for (const photo of photos) {
    if (photo.slot && (!bySlot[photo.slot] || photo.poster)) {
      bySlot[photo.slot] = photo;
    }
  }
  return bySlot;
}

/** Each slot's gallery, poster first. */
export function galleriesBySlot(
  photos: readonly PublicPhoto[],
): Partial<Record<PhotoSlot, PublicPhoto[]>> {
  const bySlot: Partial<Record<PhotoSlot, PublicPhoto[]>> = {};
  for (const photo of photos) {
    if (!photo.slot) continue;
    const gallery = bySlot[photo.slot] ?? [];
    if (photo.poster) gallery.unshift(photo);
    else gallery.push(photo);
    bySlot[photo.slot] = gallery;
  }
  return bySlot;
}

/** Every local name of a species, flattened for search. */
export function allLocalNames(species: SpeciesListItem): string[] {
  return Object.values(species.localNames).flatMap((value) => value ?? []);
}

/**
 * True for files in Convex storage, which Next.js image optimization may
 * fetch (see next.config). Other URLs are shown as they are.
 */
export function isOptimizable(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      pathname.startsWith("/api/storage/") &&
      (hostname.endsWith(".convex.cloud") || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}
