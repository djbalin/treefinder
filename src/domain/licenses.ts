import type { License } from "./options";

/**
 * Maps a license string from Wikimedia Commons or iNaturalist to one of the
 * allowed licenses, or null when it is not commercially safe (constitution,
 * product rule 4). Non-commercial (NC), no-derivatives (ND), public domain
 * marks and anything unknown are rejected.
 */
export function normalizeLicense(
  raw: string | null | undefined,
): License | null {
  if (!raw) return null;
  const value = raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");

  if (/(^|-)nc(-|$)/.test(value) || /(^|-)nd(-|$)/.test(value)) return null;
  if (value === "cc0" || value === "cc-zero" || value.startsWith("cc0-"))
    return "CC0-1.0";

  // Ported licenses such as "cc-by-sa-3.0-de" keep their base terms.
  const match = /^cc-by(-sa)?(?:-(\d\.\d))?(?:-[a-z]{2})?$/.exec(value);
  if (!match) return null;
  const [, shareAlike, version] = match;
  const base = shareAlike ? "CC-BY-SA" : "CC-BY";
  if (!version) return base;

  const versioned = `${base}-${version}`;
  return isVersionedLicense(versioned) ? versioned : null;
}

const VERSIONED = new Set([
  "CC-BY-2.0",
  "CC-BY-2.5",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-2.0",
  "CC-BY-SA-2.5",
  "CC-BY-SA-3.0",
  "CC-BY-SA-4.0",
]);

function isVersionedLicense(value: string): value is License {
  return VERSIONED.has(value);
}

/** Removes HTML tags and collapses whitespace (Commons author fields are HTML). */
export function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
