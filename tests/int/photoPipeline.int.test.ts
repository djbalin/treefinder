import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { selectPhoto } from "@/lib/photos";

let payload: Payload;
let speciesId: number;

// A 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/** Fake Commons and iNaturalist APIs: one safe photo from each. */
const fakeSources: typeof fetch = async (input) => {
  const url = String(input);
  if (url.startsWith("https://commons.wikimedia.org")) {
    const category = new URL(url).searchParams.get("gcmtitle") ?? "";
    if (category.includes("(")) return json({});
    return json({
      query: {
        pages: [
          {
            imageinfo: [
              {
                url: "https://upload.wikimedia.org/test/tree.jpg",
                descriptionurl:
                  "https://commons.wikimedia.org/wiki/File:Test_tree.jpg",
                mime: "image/jpeg",
                extmetadata: {
                  License: { value: "cc-by-4.0" },
                  Artist: { value: "Test Fotograf" },
                },
              },
            ],
          },
        ],
      },
    });
  }
  if (url.includes("/v1/taxa"))
    return json({
      results: [{ id: 99, name: "Testus pipelinus", rank: "species" }],
    });
  if (url.includes("/v1/observations")) {
    return json({
      results: [
        {
          id: 5,
          uri: "https://www.inaturalist.org/observations/5",
          photos: [
            {
              id: 7,
              url: "https://inaturalist-open-data.s3.amazonaws.com/photos/7/square.jpg",
              license_code: "cc0",
              attribution: "no rights reserved",
            },
          ],
        },
      ],
    });
  }
  throw new Error(`Unexpected fetch ${url}`);
};

describe("photo pipeline", () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
    const species = await payload.create({
      collection: "species",
      locale: "da",
      data: {
        name: "Pipelineart",
        latinName: "Testus pipelinus",
        slug: `test-pipeline-${Date.now()}`,
        status: "aiDraft",
      },
    });
    speciesId = species.id;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    await payload.delete({
      collection: "photos",
      where: { species: { equals: speciesId } },
    });
    await payload.delete({ collection: "species", id: speciesId });
  });

  it("queues and runs the workflow, storing candidates once", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeSources));
    // iNaturalist calls are spaced a second apart; skip the wait.
    vi.useFakeTimers({
      toFake: ["setTimeout"],
      shouldAdvanceTime: true,
      advanceTimeDelta: 1000,
    });

    for (let run = 0; run < 2; run++) {
      const job = await payload.jobs.queue({
        workflow: "fetchPhotoCandidates",
        input: { species: speciesId },
      });
      await payload.jobs.runByID({ id: job.id });
    }
    vi.useRealTimers();

    const photos = await payload.find({
      collection: "photos",
      where: { species: { equals: speciesId } },
      sort: "id",
    });
    expect(
      photos.docs.map((photo) => [photo.source, photo.status, photo.license]),
    ).toEqual([
      ["commons", "candidate", "CC-BY-4.0"],
      ["inaturalist", "candidate", "CC0-1.0"],
    ]);
    expect(photos.docs[1]?.remoteUrl).toBe(
      "https://inaturalist-open-data.s3.amazonaws.com/photos/7/large.jpg",
    );
  });

  it("downloads the file when a candidate is selected", async () => {
    const candidate = (
      await payload.find({
        collection: "photos",
        where: {
          species: { equals: speciesId },
          source: { equals: "commons" },
        },
      })
    ).docs[0];
    expect(candidate).toBeDefined();

    const imageFetch = vi.fn(
      async () =>
        new Response(PNG, {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
    ) as unknown as typeof fetch;
    const selected = await selectPhoto(
      { payload },
      candidate?.id ?? 0,
      "wholeTree",
      imageFetch,
    );

    expect(imageFetch).toHaveBeenCalledWith(
      "https://upload.wikimedia.org/test/tree.jpg",
    );
    expect(selected.status).toBe("selected");
    expect(selected.slot).toBe("wholeTree");
    expect(selected.filename).toMatch(/^photo-\d+.*\.png$/);
  });

  it("refuses to download from unknown hosts", async () => {
    const photo = await payload.create({
      collection: "photos",
      data: {
        species: speciesId,
        status: "candidate",
        source: "commons",
        license: "CC0-1.0",
        author: "X",
        attribution: "X",
        remoteUrl: "https://evil.example.com/a.jpg",
      },
    });
    await expect(
      selectPhoto({ payload }, photo.id, "bark", vi.fn()),
    ).rejects.toThrow(/må ikke hentes/);
  });
});
