import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { REQUIRED_PHOTO_SLOTS } from "@/domain/options";
import { richTextFromParagraphs } from "@/domain/richText";

let payload: Payload;
const slug = `test-art-${Date.now()}`;
let speciesId: number;

const text = richTextFromParagraphs(["Tekst."]);

async function createPhoto(
  slot: (typeof REQUIRED_PHOTO_SLOTS)[number],
  status: "candidate" | "selected",
) {
  return payload.create({
    collection: "photos",
    data: {
      species: speciesId,
      slot,
      status,
      source: "upload",
      license: "own",
      author: "Test",
      attribution: "Test, eget foto",
    },
  });
}

describe("data model", () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
    const species = await payload.create({
      collection: "species",
      data: {
        name: "Testart",
        latinName: "Testus testus",
        slug,
        status: "aiDraft",
      },
      locale: "da",
    });
    speciesId = species.id;
  });

  afterAll(async () => {
    await payload.delete({
      collection: "photos",
      where: { species: { equals: speciesId } },
    });
    await payload.delete({ collection: "species", id: speciesId });
  });

  it("refuses to publish an incomplete card", async () => {
    await expect(
      payload.update({
        collection: "species",
        id: speciesId,
        data: { status: "published" },
      }),
    ).rejects.toThrow(/Kan ikke udgive/);
  });

  it("hides unpublished species from visitors", async () => {
    const visible = await payload.find({
      collection: "species",
      where: { slug: { equals: slug } },
      overrideAccess: false,
    });
    expect(visible.docs).toHaveLength(0);
  });

  it("keeps one selected photo per slot", async () => {
    const first = await createPhoto("bark", "selected");
    const second = await createPhoto("bark", "selected");

    const reloaded = await payload.findByID({
      collection: "photos",
      id: first.id,
    });
    expect(reloaded.status).toBe("candidate");
    expect(
      (await payload.findByID({ collection: "photos", id: second.id })).status,
    ).toBe("selected");
  });

  it("publishes once every rule holds, and then shows it to visitors", async () => {
    for (const slot of REQUIRED_PHOTO_SLOTS) {
      if (slot !== "bark") await createPhoto(slot, "selected");
    }

    await payload.update({
      collection: "species",
      id: speciesId,
      locale: "da",
      data: {
        greenCarving: "easy",
        dryHardness: "soft",
        grainTexture: text,
        goodFor: text,
        drying: text,
        foodSafety: text,
        foodSafetyChecked: true,
        sources: [
          { title: "Kilde", url: "https://example.com", field: "general" },
        ],
      },
    });

    const published = await payload.update({
      collection: "species",
      id: speciesId,
      data: { status: "published" },
    });
    expect(published.status).toBe("published");

    const visible = await payload.find({
      collection: "species",
      where: { slug: { equals: slug } },
      overrideAccess: false,
    });
    expect(visible.docs).toHaveLength(1);
  });

  it("only shows selected photos to visitors", async () => {
    const visible = await payload.find({
      collection: "photos",
      where: { species: { equals: speciesId } },
      overrideAccess: false,
    });
    expect(visible.docs.every((photo) => photo.status === "selected")).toBe(
      true,
    );
    expect(visible.docs).toHaveLength(4);
  });
});
