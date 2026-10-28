import type { PhotoSlot } from "../../domain/options";
import {
  type CommonsResponse,
  commonsCategoryFileCount,
  commonsQueryUrl,
  parseCommonsResponse,
} from "./commons";
import { fetchInaturalistCandidates } from "./inaturalist";
import { type Fetcher, type PhotoCandidate, USER_AGENT } from "./types";

/** The slots the catalog fetch fills (product spec 7.4). */
export const CATALOG_SLOTS = [
  "wholeTree",
  "bark",
  "leaf",
] as const satisfies readonly PhotoSlot[];
export type CatalogSlot = (typeof CATALOG_SLOTS)[number];

/** Candidates per slot and fetch. */
export const CATALOG_BATCH = 20;

/** A Commons leaves category needs this many files to be used over iNaturalist. */
export const MIN_COMMONS_LEAVES = 20;

/** Where the next catalog fetch for a slot continues. */
export type CatalogCursor =
  | {
      source: "commons";
      category: string;
      continueParams: Record<string, string> | null;
    }
  | { source: "inaturalist"; page: number };

/** The best source for a slot, before anything has been fetched. */
export async function firstCursor(
  latinName: string,
  slot: CatalogSlot,
  fetcher: Fetcher = fetch,
): Promise<CatalogCursor> {
  const commons = (category: string): CatalogCursor => ({
    source: "commons",
    category,
    continueParams: null,
  });
  if (slot === "bark") return commons(`Category:${latinName} (bark)`);
  if (slot === "wholeTree") return commons(`Category:${latinName}`);

  const leaves = `Category:${latinName} (leaves)`;
  const files = await commonsCategoryFileCount(leaves, fetcher);
  return files >= MIN_COMMONS_LEAVES
    ? commons(leaves)
    : { source: "inaturalist", page: 1 };
}

/**
 * One batch of candidates from the cursor's source, and the cursor for the
 * next batch (null when the source has nothing more).
 */
export async function fetchCatalogBatch(
  latinName: string,
  cursor: CatalogCursor,
  fetcher: Fetcher = fetch,
  pause?: (ms: number) => Promise<unknown>,
): Promise<{ candidates: PhotoCandidate[]; next: CatalogCursor | null }> {
  if (cursor.source === "inaturalist") {
    const candidates = await fetchInaturalistCandidates(
      latinName,
      fetcher,
      CATALOG_BATCH,
      pause,
      cursor.page,
    );
    return {
      candidates,
      next:
        candidates.length > 0
          ? { source: "inaturalist", page: cursor.page + 1 }
          : null,
    };
  }

  const response = await fetcher(
    commonsQueryUrl(
      cursor.category,
      CATALOG_BATCH,
      cursor.continueParams ?? {},
    ),
    { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(
      `Wikimedia Commons answered ${response.status} for ${cursor.category}`,
    );
  }
  const data = (await response.json()) as CommonsResponse;
  return {
    candidates: parseCommonsResponse(data),
    next: data.continue ? { ...cursor, continueParams: data.continue } : null,
  };
}
