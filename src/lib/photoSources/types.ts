import type { License, PhotoSlot, PhotoSource } from "../../domain/options";

/** A photo found at a source, before it is stored as a `photos` candidate. */
export type PhotoCandidate = {
  source: Exclude<PhotoSource, "upload">;
  sourceUrl: string;
  remoteUrl: string;
  author: string;
  license: License;
  attribution: string;
  /** Slot suggested by where the photo was found (for example a bark category). */
  slotHint?: PhotoSlot;
};

export type Fetcher = typeof fetch;

/**
 * Identifies Treefinder to Wikimedia and iNaturalist, as Wikimedia's
 * User-Agent policy asks.
 */
export const USER_AGENT =
  "Treefinder/0.1 (https://github.com/djbalin/treefinder)";
