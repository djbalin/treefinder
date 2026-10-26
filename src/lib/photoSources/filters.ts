import type { PhotoCandidate } from "./types";

/** Hosts a selected photo may be downloaded from. */
export const ALLOWED_IMAGE_HOSTS = [
  "upload.wikimedia.org",
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
];

/** The largest photo file copied into storage. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

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
