import { normalizeLicense, stripHtml } from "../../domain/licenses";
import type { PhotoSlot } from "../../domain/options";
import { type Fetcher, type PhotoCandidate, USER_AGENT } from "./types";

const API = "https://commons.wikimedia.org/w/api.php";

/** Categories to search per species, with the slot each one suggests. */
export function commonsCategories(
  latinName: string,
): { title: string; slotHint?: PhotoSlot }[] {
  return [
    { title: `Category:${latinName}` },
    { title: `Category:${latinName} (bark)`, slotHint: "bark" },
    { title: `Category:${latinName} (leaves)`, slotHint: "leaf" },
  ];
}

type ExtMetadata = Record<string, { value?: string } | undefined>;

type CommonsPage = {
  title?: string;
  imageinfo?: {
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    mime?: string;
    extmetadata?: ExtMetadata;
  }[];
};

export type CommonsResponse = {
  query?: { pages?: CommonsPage[] };
  /** Present when the category has more files: send it back for the next page. */
  continue?: Record<string, string>;
};

/** Turns one Commons API response into candidates, dropping unsafe licenses. */
export function parseCommonsResponse(
  response: CommonsResponse,
  slotHint?: PhotoSlot,
): PhotoCandidate[] {
  const pages = response.query?.pages ?? [];
  const candidates: PhotoCandidate[] = [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info?.url || !info.descriptionurl) continue;
    if (info.mime && !/^image\/(jpeg|png|webp)$/.test(info.mime)) continue;

    const meta = info.extmetadata ?? {};
    const license = normalizeLicense(
      meta.License?.value ?? meta.LicenseShortName?.value,
    );
    if (!license) continue;

    const author = stripHtml(meta.Artist?.value) || "Ukendt fotograf";
    const licenseName = meta.LicenseShortName?.value ?? license;
    candidates.push({
      source: "commons",
      sourceUrl: info.descriptionurl,
      remoteUrl: info.thumburl ?? info.url,
      author,
      license,
      attribution: `${author}, ${licenseName}, via Wikimedia Commons`,
      slotHint,
    });
  }
  return candidates;
}

export function commonsQueryUrl(
  categoryTitle: string,
  limit: number,
  continueParams: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    ...continueParams,
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "categorymembers",
    gcmtitle: categoryTitle,
    gcmtype: "file",
    gcmlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1600",
  });
  return `${API}?${params}`;
}

/** How many files a Commons category holds directly (0 when it is missing). */
export async function commonsCategoryFileCount(
  categoryTitle: string,
  fetcher: Fetcher = fetch,
): Promise<number> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "categoryinfo",
    titles: categoryTitle,
  });
  const response = await fetcher(`${API}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Wikimedia Commons answered ${response.status} for ${categoryTitle}`,
    );
  }
  const data = (await response.json()) as {
    query?: { pages?: { categoryinfo?: { files?: number } }[] };
  };
  return data.query?.pages?.[0]?.categoryinfo?.files ?? 0;
}

/** Fetches candidates from the species category and its bark and leaf subcategories. */
export async function fetchCommonsCandidates(
  latinName: string,
  fetcher: Fetcher = fetch,
  perCategory = 8,
): Promise<PhotoCandidate[]> {
  const results: PhotoCandidate[] = [];
  for (const category of commonsCategories(latinName)) {
    const response = await fetcher(
      commonsQueryUrl(category.title, perCategory),
      {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Wikimedia Commons answered ${response.status} for ${category.title}`,
      );
    }
    results.push(
      ...parseCommonsResponse(
        (await response.json()) as CommonsResponse,
        category.slotHint,
      ),
    );
  }
  return results;
}
