import type { Payload, PayloadRequest } from "payload";
import type { PhotoSlot } from "@/domain/options";
import { fetchCommonsCandidates } from "./photoSources/commons";
import { fetchInaturalistCandidates } from "./photoSources/inaturalist";
import type { Fetcher, PhotoCandidate } from "./photoSources/types";

/** Hosts a selected photo may be downloaded from. */
export const ALLOWED_IMAGE_HOSTS = [
  "upload.wikimedia.org",
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
];

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/** Candidates whose source page or image is not already stored for the species. */
export function newCandidates(
  candidates: PhotoCandidate[],
  existing: { sourceUrl?: string | null; remoteUrl?: string | null }[],
): PhotoCandidate[] {
  const seen = new Set(
    existing
      .flatMap((photo) => [photo.sourceUrl, photo.remoteUrl])
      .filter(Boolean),
  );
  const result: PhotoCandidate[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate.remoteUrl) || seen.has(candidate.sourceUrl))
      continue;
    seen.add(candidate.remoteUrl);
    seen.add(candidate.sourceUrl);
    result.push(candidate);
  }
  return result;
}

type Context = { payload: Payload; req?: PayloadRequest };

/** Stores new candidates for a species and returns how many were added. */
export async function storeCandidates(
  { payload, req }: Context,
  speciesId: number,
  candidates: PhotoCandidate[],
): Promise<number> {
  const existing = await payload.find({
    collection: "photos",
    where: { species: { equals: speciesId } },
    depth: 0,
    pagination: false,
    req,
  });
  const fresh = newCandidates(candidates, existing.docs);

  for (const candidate of fresh) {
    await payload.create({
      collection: "photos",
      req,
      data: {
        species: speciesId,
        status: "candidate",
        slot: candidate.slotHint,
        source: candidate.source,
        sourceUrl: candidate.sourceUrl,
        remoteUrl: candidate.remoteUrl,
        author: candidate.author,
        license: candidate.license,
        attribution: candidate.attribution,
        fetchedAt: new Date().toISOString(),
      },
    });
  }
  return fresh.length;
}

export async function speciesLatinName(
  { payload, req }: Context,
  speciesId: number,
): Promise<string> {
  const species = await payload.findByID({
    collection: "species",
    id: speciesId,
    depth: 0,
    req,
  });
  return species.latinName;
}

export async function collectCommons(
  context: Context,
  speciesId: number,
  fetcher?: Fetcher,
) {
  const latinName = await speciesLatinName(context, speciesId);
  return storeCandidates(
    context,
    speciesId,
    await fetchCommonsCandidates(latinName, fetcher),
  );
}

export async function collectInaturalist(
  context: Context,
  speciesId: number,
  fetcher?: Fetcher,
) {
  const latinName = await speciesLatinName(context, speciesId);
  return storeCandidates(
    context,
    speciesId,
    await fetchInaturalistCandidates(latinName, fetcher),
  );
}

/**
 * Selects a photo for a slot. A candidate that only links to its image is
 * downloaded first, so published photos never depend on another site.
 */
export async function selectPhoto(
  { payload, req }: Context,
  photoId: number,
  slot: PhotoSlot,
  fetcher: Fetcher = fetch,
) {
  const photo = await payload.findByID({
    collection: "photos",
    id: photoId,
    depth: 0,
    req,
  });
  const data = { status: "selected" as const, slot };

  if (photo.filename || !photo.remoteUrl) {
    return payload.update({ collection: "photos", id: photoId, data, req });
  }

  if (!isAllowedImageUrl(photo.remoteUrl)) {
    throw new Error(`Billedet må ikke hentes fra ${photo.remoteUrl}.`);
  }
  const response = await fetcher(photo.remoteUrl);
  const mimetype = response.headers.get("content-type")?.split(";")[0] ?? "";
  if (!response.ok || !mimetype.startsWith("image/")) {
    throw new Error(`Kunne ikke hente billedet (${response.status}).`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("Billedet er for stort.");
  }

  const extension = mimetype.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return payload.update({
    collection: "photos",
    id: photoId,
    data,
    file: {
      data: buffer,
      mimetype,
      name: `photo-${photoId}.${extension}`,
      size: buffer.byteLength,
    },
    req,
  });
}

export async function rejectPhoto({ payload, req }: Context, photoId: number) {
  return payload.update({
    collection: "photos",
    id: photoId,
    data: { status: "rejected" },
    req,
  });
}
