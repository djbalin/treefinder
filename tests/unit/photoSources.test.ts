import { describe, expect, it } from "vitest";
import { normalizeLicense, stripHtml } from "@/domain/licenses";
import {
  commonsCategories,
  parseCommonsResponse,
} from "@/lib/photoSources/commons";
import { isAllowedImageUrl, newCandidates } from "@/lib/photoSources/filters";
import {
  largePhotoUrl,
  parseObservations,
  pickTaxon,
} from "@/lib/photoSources/inaturalist";

describe("normalizeLicense", () => {
  it.each([
    ["cc0", "CC0-1.0"],
    ["CC0 1.0", "CC0-1.0"],
    ["cc-by-4.0", "CC-BY-4.0"],
    ["CC BY-SA 3.0", "CC-BY-SA-3.0"],
    ["cc-by-sa-3.0-de", "CC-BY-SA-3.0"],
    ["cc-by", "CC-BY"],
    ["cc-by-sa", "CC-BY-SA"],
  ])("accepts %s as %s", (raw, expected) => {
    expect(normalizeLicense(raw)).toBe(expected);
  });

  it.each([
    "cc-by-nc",
    "cc-by-nc-sa-4.0",
    "CC BY-ND 4.0",
    "pd",
    "Public domain",
    "",
    null,
    "cc-by-9.9",
  ])("rejects %s", (raw) => {
    expect(normalizeLicense(raw)).toBeNull();
  });
});

describe("stripHtml", () => {
  it("keeps only the text of a Commons author field", () => {
    expect(
      stripHtml(
        '<a href="//commons.wikimedia.org/wiki/User:Jane">Jane&nbsp;Doe</a>',
      ),
    ).toBe("Jane Doe");
  });
});

describe("Wikimedia Commons", () => {
  it("searches the species category and its bark and leaf subcategories", () => {
    expect(commonsCategories("Tilia cordata")).toEqual([
      { title: "Category:Tilia cordata" },
      { title: "Category:Tilia cordata (bark)", slotHint: "bark" },
      { title: "Category:Tilia cordata (leaves)", slotHint: "leaf" },
    ]);
  });

  it("parses files with safe licenses and drops the rest", () => {
    const candidates = parseCommonsResponse(
      {
        query: {
          pages: [
            {
              title: "File:Lind bark.jpg",
              imageinfo: [
                {
                  url: "https://upload.wikimedia.org/a/lind.jpg",
                  thumburl:
                    "https://upload.wikimedia.org/thumb/a/lind.jpg/1600px-lind.jpg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:Lind_bark.jpg",
                  mime: "image/jpeg",
                  extmetadata: {
                    License: { value: "cc-by-sa-4.0" },
                    LicenseShortName: { value: "CC BY-SA 4.0" },
                    Artist: { value: "<a href='x'>Jane Doe</a>" },
                  },
                },
              ],
            },
            {
              title: "File:NC.jpg",
              imageinfo: [
                {
                  url: "https://upload.wikimedia.org/b.jpg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:NC.jpg",
                  mime: "image/jpeg",
                  extmetadata: { License: { value: "cc-by-nc-2.0" } },
                },
              ],
            },
            {
              title: "File:Map.svg",
              imageinfo: [
                {
                  url: "https://upload.wikimedia.org/c.svg",
                  descriptionurl:
                    "https://commons.wikimedia.org/wiki/File:Map.svg",
                  mime: "image/svg+xml",
                  extmetadata: { License: { value: "cc0" } },
                },
              ],
            },
          ],
        },
      },
      "bark",
    );

    expect(candidates).toEqual([
      {
        source: "commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Lind_bark.jpg",
        remoteUrl:
          "https://upload.wikimedia.org/thumb/a/lind.jpg/1600px-lind.jpg",
        author: "Jane Doe",
        license: "CC-BY-SA-4.0",
        attribution: "Jane Doe, CC BY-SA 4.0, via Wikimedia Commons",
        slotHint: "bark",
      },
    ]);
  });
});

describe("iNaturalist", () => {
  it("picks the species taxon with the exact Latin name", () => {
    expect(
      pickTaxon(
        {
          results: [
            { id: 1, name: "Tilia", rank: "genus" },
            { id: 2, name: "Tilia cordata", rank: "species" },
          ],
        },
        "Tilia cordata",
      ),
    ).toBe(2);
    expect(pickTaxon({ results: [] }, "Tilia cordata")).toBeNull();
  });

  it("uses the large size instead of the square thumbnail", () => {
    expect(
      largePhotoUrl(
        "https://inaturalist-open-data.s3.amazonaws.com/photos/1/square.jpg",
      ),
    ).toBe("https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpg");
  });

  it("parses photos with safe licenses up to the limit", () => {
    const candidates = parseObservations(
      {
        results: [
          {
            id: 10,
            uri: "https://www.inaturalist.org/observations/10",
            photos: [
              {
                id: 1,
                url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1/square.jpg",
                license_code: "cc-by",
                attribution: "(c) Jane Doe, some rights reserved (CC BY)",
              },
              {
                id: 2,
                url: "https://inaturalist-open-data.s3.amazonaws.com/photos/2/square.jpg",
                license_code: "cc-by-nc",
                attribution: "(c) X",
              },
              {
                id: 3,
                url: "https://inaturalist-open-data.s3.amazonaws.com/photos/3/square.jpg",
                license_code: "cc0",
                attribution: "no rights reserved",
              },
            ],
          },
        ],
      },
      1,
    );

    expect(candidates).toEqual([
      {
        source: "inaturalist",
        sourceUrl: "https://www.inaturalist.org/observations/10",
        remoteUrl:
          "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpg",
        author: "Jane Doe",
        license: "CC-BY",
        attribution:
          "(c) Jane Doe, some rights reserved (CC BY), via iNaturalist",
      },
    ]);
  });
});

describe("photo storage rules", () => {
  it("only downloads from known image hosts over https", () => {
    expect(isAllowedImageUrl("https://upload.wikimedia.org/a.jpg")).toBe(true);
    expect(
      isAllowedImageUrl(
        "https://inaturalist-open-data.s3.amazonaws.com/p/1/large.jpg",
      ),
    ).toBe(true);
    expect(isAllowedImageUrl("http://upload.wikimedia.org/a.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://evil.example.com/a.jpg")).toBe(false);
    expect(isAllowedImageUrl("not a url")).toBe(false);
  });

  it("skips candidates that are already stored", () => {
    const base = {
      source: "commons" as const,
      author: "A",
      license: "CC0-1.0" as const,
      attribution: "A",
    };
    const fresh = newCandidates(
      [
        { ...base, sourceUrl: "s1", remoteUrl: "r1" },
        { ...base, sourceUrl: "s2", remoteUrl: "r2" },
        { ...base, sourceUrl: "s2", remoteUrl: "r2" },
      ],
      [{ sourceUrl: "s1", remoteUrl: "r1" }],
    );
    expect(fresh.map((candidate) => candidate.sourceUrl)).toEqual(["s2"]);
  });
});
