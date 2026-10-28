import { describe, expect, it } from "vitest";
import {
  type CatalogCursor,
  fetchCatalogBatch,
  firstCursor,
} from "@/lib/photoSources/catalog";

/** A fetcher that answers each request with the next canned JSON body. */
function fakeFetcher(bodies: unknown[]) {
  const urls: string[] = [];
  const fetcher = (async (input: RequestInfo | URL) => {
    urls.push(String(input));
    const body = bodies.shift();
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  return { fetcher, urls };
}

const commonsFile = (name: string) => ({
  title: `File:${name}`,
  imageinfo: [
    {
      url: `https://upload.wikimedia.org/a/${name}`,
      thumburl: `https://upload.wikimedia.org/thumb/a/${name}/1600px-${name}`,
      descriptionurl: `https://commons.wikimedia.org/wiki/File:${name}`,
      mime: "image/jpeg",
      extmetadata: {
        LicenseShortName: { value: "CC BY-SA 4.0" },
        License: { value: "cc-by-sa-4.0" },
        Artist: { value: "Fotograf" },
      },
    },
  ],
});

describe("catalog sources (product spec 7.4)", () => {
  it("takes bark from the Commons bark category only", async () => {
    const { fetcher, urls } = fakeFetcher([]);
    expect(await firstCursor("Tilia cordata", "bark", fetcher)).toEqual({
      source: "commons",
      category: "Category:Tilia cordata (bark)",
      continueParams: null,
    });
    expect(urls).toEqual([]);
  });

  it("takes the whole tree from the main Commons category", async () => {
    const { fetcher } = fakeFetcher([]);
    const cursor = await firstCursor("Tilia cordata", "wholeTree", fetcher);
    expect(cursor).toMatchObject({ category: "Category:Tilia cordata" });
  });

  it("uses the Commons leaves category only when it holds 20 files", async () => {
    const big = fakeFetcher([
      { query: { pages: [{ categoryinfo: { files: 70 } }] } },
    ]);
    expect(await firstCursor("Tilia cordata", "leaf", big.fetcher)).toEqual({
      source: "commons",
      category: "Category:Tilia cordata (leaves)",
      continueParams: null,
    });

    const small = fakeFetcher([
      { query: { pages: [{ categoryinfo: { files: 7 } }] } },
    ]);
    expect(await firstCursor("Taxus baccata", "leaf", small.fetcher)).toEqual({
      source: "inaturalist",
      page: 1,
    });
  });

  it("follows a Commons continuation and stops at the end", async () => {
    const cursor: CatalogCursor = {
      source: "commons",
      category: "Category:Tilia cordata (bark)",
      continueParams: null,
    };
    const { fetcher, urls } = fakeFetcher([
      {
        query: { pages: [commonsFile("a.jpg")] },
        continue: { gcmcontinue: "file|b", continue: "gcmcontinue||" },
      },
      { query: { pages: [commonsFile("b.jpg")] } },
    ]);

    const first = await fetchCatalogBatch("Tilia cordata", cursor, fetcher);
    expect(first.candidates.map((item) => item.sourceUrl)).toEqual([
      "https://commons.wikimedia.org/wiki/File:a.jpg",
    ]);
    expect(first.next).toMatchObject({
      continueParams: { gcmcontinue: "file|b" },
    });

    const second = await fetchCatalogBatch(
      "Tilia cordata",
      first.next as CatalogCursor,
      fetcher,
    );
    expect(second.next).toBeNull();
    expect(new URL(urls[1] ?? "").searchParams.get("gcmcontinue")).toBe(
      "file|b",
    );
  });
});
