import "dotenv/config";
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { REQUIRED_PHOTO_SLOTS } from "@/domain/options";
import { richTextFromParagraphs } from "@/domain/richText";

/** Every fixture slug starts with this prefix so teardown can find it. */
export const PREFIX = "e2e-";

export const fixtures = {
  lime: { slug: `${PREFIX}lind`, name: "E2E lind" },
  yew: { slug: `${PREFIX}taks`, name: "E2E taks" },
  draft: { slug: `${PREFIX}kladde`, name: "E2E kladde" },
};

const text = (value: string) => richTextFromParagraphs([value]);

async function createPublished(
  payload: Payload,
  data: {
    slug: string;
    name: string;
    latinName: string;
    isWarning?: boolean;
    warningReason?: string;
    localNames?: string[];
  },
) {
  const species = await payload.create({
    collection: "species",
    locale: "da",
    data: {
      slug: data.slug,
      name: data.name,
      latinName: data.latinName,
      status: "approved",
      isWarning: data.isWarning ?? false,
      warningReason: data.warningReason,
      greenCarving: "easy",
      dryHardness: "soft",
      jankaN: 2600,
      goodForTags: ["spoons", "figures"],
      grainTexture: text("Fin og jævn ved."),
      colourSmell: text("Lys, næsten hvid."),
      goodFor: text("Skeer og figurer."),
      riving: text("Kløver let."),
      drying: text("Tørrer hurtigt."),
      foodSafety: text("Regnes for sikkert til madredskaber."),
      foodSafetyChecked: true,
      foodSafetyCheckedAt: "2026-10-01T00:00:00.000Z",
      idFeatures: {
        leaf: text("Hjerteformede blade."),
        bark: text("Glat grå bark."),
      },
      localNames: { da: [data.name], en: data.localNames ?? [] },
      sources: [
        {
          title: "Kilde om snitning",
          url: "https://example.com/snit",
          field: "carving",
        },
        {
          title: "Kilde om fødevaresikkerhed",
          url: "https://example.com/mad",
          field: "foodSafety",
        },
      ],
    },
  });

  for (const slot of REQUIRED_PHOTO_SLOTS) {
    await payload.create({
      collection: "photos",
      data: {
        species: species.id,
        slot,
        status: "selected",
        source: "upload",
        license: "CC-BY-4.0",
        author: "Test Fotograf",
        attribution: `Test Fotograf, ${slot}`,
        sourceUrl: "https://example.com/foto",
        remoteUrl: "https://example.com/foto.jpg",
      },
    });
  }

  return payload.update({
    collection: "species",
    id: species.id,
    data: { status: "published" },
  });
}

async function removeFixtures(payload: Payload) {
  const existing = await payload.find({
    collection: "species",
    where: { slug: { like: PREFIX } },
    pagination: false,
    depth: 0,
  });
  const ids = existing.docs.map((doc) => doc.id);
  if (ids.length === 0) return;
  await payload.delete({
    collection: "photos",
    where: { species: { in: ids } },
  });
  await payload.delete({ collection: "species", where: { id: { in: ids } } });
}

export default async function globalSetup() {
  const payload = await getPayload({ config });
  await removeFixtures(payload);

  const lime = await createPublished(payload, {
    ...fixtures.lime,
    latinName: "Tilia cordata",
    localNames: ["Small-leaved lime", "linden"],
  });
  const yew = await createPublished(payload, {
    ...fixtures.yew,
    latinName: "Taxus baccata",
    isWarning: true,
    warningReason: "Alle dele af taks er giftige.",
  });
  await payload.update({
    collection: "species",
    id: lime.id,
    data: { lookAlikes: [yew.id] },
  });

  await payload.create({
    collection: "species",
    locale: "da",
    data: {
      ...fixtures.draft,
      latinName: "Draftus draftus",
      status: "aiDraft",
    },
  });

  for (const slug of ["whereToGetWood", "about"] as const) {
    const page = await payload.findGlobal({ slug, locale: "da" });
    if (!page.title) {
      await payload.updateGlobal({
        slug,
        locale: "da",
        data: {
          title: slug === "about" ? "Om Treefinder" : "Skaf træ",
          content: text("Testindhold."),
        },
      });
    }
  }

  return async () => {
    await removeFixtures(payload);
  };
}
