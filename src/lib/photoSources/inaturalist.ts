import { normalizeLicense } from "@/domain/licenses";
import { type Fetcher, type PhotoCandidate, USER_AGENT } from "./types";

const API = "https://api.inaturalist.org/v1";

type Taxon = { id: number; name?: string; rank?: string };
export type TaxaResponse = { results?: Taxon[] };

type ObservationPhoto = {
  id: number;
  url?: string;
  license_code?: string | null;
  attribution?: string;
};
type Observation = { id: number; uri?: string; photos?: ObservationPhoto[] };
export type ObservationsResponse = { results?: Observation[] };

/** The taxon whose name is exactly the Latin name, if iNaturalist knows it. */
export function pickTaxon(
  response: TaxaResponse,
  latinName: string,
): number | null {
  const match = (response.results ?? []).find(
    (taxon) =>
      taxon.name?.toLowerCase() === latinName.toLowerCase() &&
      taxon.rank === "species",
  );
  return match?.id ?? null;
}

/** Photo URLs come back as square thumbnails; "large" is about 1024 px. */
export function largePhotoUrl(url: string): string {
  return url.replace(/\/square\.(jpe?g|png)/i, "/large.$1");
}

export function parseObservations(
  response: ObservationsResponse,
  limit: number,
): PhotoCandidate[] {
  const candidates: PhotoCandidate[] = [];
  for (const observation of response.results ?? []) {
    for (const photo of observation.photos ?? []) {
      const license = normalizeLicense(photo.license_code);
      if (!license || !photo.url) continue;
      const attribution = photo.attribution ?? "iNaturalist";
      candidates.push({
        source: "inaturalist",
        sourceUrl:
          observation.uri ??
          `https://www.inaturalist.org/observations/${observation.id}`,
        remoteUrl: largePhotoUrl(photo.url),
        // "(c) Jane Doe, some rights reserved (CC BY)" -> "Jane Doe"
        author:
          attribution
            .replace(/^\(c\)\s*/i, "")
            .split(",")[0]
            ?.trim() || "Ukendt fotograf",
        license,
        attribution: `${attribution}, via iNaturalist`,
      });
      if (candidates.length >= limit) return candidates;
    }
  }
  return candidates;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Research-grade photos under safe licenses. Calls are spaced about a second
 * apart, as iNaturalist asks.
 */
export async function fetchInaturalistCandidates(
  latinName: string,
  fetcher: Fetcher = fetch,
  limit = 10,
  pause: (ms: number) => Promise<unknown> = sleep,
): Promise<PhotoCandidate[]> {
  const headers = { "User-Agent": USER_AGENT, Accept: "application/json" };

  const taxaUrl = `${API}/taxa?${new URLSearchParams({ q: latinName, rank: "species", per_page: "5" })}`;
  const taxa = await fetcher(taxaUrl, { headers });
  if (!taxa.ok)
    throw new Error(
      `iNaturalist answered ${taxa.status} for taxon ${latinName}`,
    );
  const taxonId = pickTaxon((await taxa.json()) as TaxaResponse, latinName);
  if (!taxonId) return [];

  await pause(1000);

  const observationsUrl = `${API}/observations?${new URLSearchParams({
    taxon_id: String(taxonId),
    quality_grade: "research",
    photo_license: "cc0,cc-by,cc-by-sa",
    photos: "true",
    order_by: "votes",
    per_page: String(limit),
  })}`;
  const observations = await fetcher(observationsUrl, { headers });
  if (!observations.ok)
    throw new Error(
      `iNaturalist answered ${observations.status} for observations`,
    );
  return parseObservations(
    (await observations.json()) as ObservationsResponse,
    limit,
  );
}
