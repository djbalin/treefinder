import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/** A fake Claude that answers each section with a valid submission. */
vi.mock("@/lib/drafting/claude", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/drafting/claude")>();
  const answers: Record<string, unknown> = {
    carving: {
      greenCarving: "easy",
      dryHardness: "soft",
      jankaN: null,
      grainTexture: ["Fin og jævn."],
      colourSmell: ["Lys."],
      goodForTags: ["spoons"],
      goodFor: ["Skeer."],
      riving: ["Kløver let."],
      drying: ["Tørrer hurtigt."],
      sources: [
        { title: "Snit", url: "https://example.com/snit", field: "carving" },
      ],
    },
    safety: {
      foodSafety: ["Regnes for sikkert."],
      warningReason: null,
      sources: [
        { title: "Mad", url: "https://example.com/mad", field: "foodSafety" },
      ],
    },
    identification: {
      idFeatures: {
        leaf: ["Hjerteformet."],
        bark: ["Glat."],
        twig: [],
        shape: [],
        cutWood: [],
      },
      filterTraits: {
        leafType: ["broad"],
        arrangement: ["alternate"],
        leafShape: ["simple"],
        leafEdge: ["toothed"],
        bark: ["smooth"],
        thorns: ["no"],
      },
      localNames: {
        sv: [],
        nb: [],
        de: ["Winterlinde"],
        nl: [],
        en: ["Small-leaved lime"],
      },
      sources: [],
    },
  };
  return {
    ...original,
    createDraftClient: () => ({ beta: { messages: { stream: vi.fn() } } }),
    draftSection: vi.fn(async (_client: unknown, section: string) => ({
      input: answers[section],
      usage: { input_tokens: 0, output_tokens: 0 },
      turns: 1,
    })),
  };
});

let payload: Payload;
const ids: number[] = [];

async function createSpecies(status: "aiDraft" | "approved") {
  const species = await payload.create({
    collection: "species",
    locale: "da",
    data: {
      name: `Udkast ${status}`,
      latinName: "Testus draftus",
      slug: `test-draft-${status}-${Date.now()}`,
      status,
      localNames: { da: ["Udkastart"] },
    },
  });
  ids.push(species.id);
  return species;
}

async function runDraft(speciesId: number) {
  const job = await payload.jobs.queue({
    workflow: "draftCard",
    input: { species: speciesId },
  });
  await payload.jobs.runByID({ id: job.id });
}

describe("card drafting workflow", () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
  });

  afterAll(async () => {
    await payload.delete({ collection: "species", where: { id: { in: ids } } });
  });

  it("drafts all three sections into the Danish card", async () => {
    const species = await createSpecies("aiDraft");
    await runDraft(species.id);

    const drafted = await payload.findByID({
      collection: "species",
      id: species.id,
      locale: "da",
    });
    expect(drafted.status).toBe("aiDraft");
    expect(drafted.greenCarving).toBe("easy");
    expect(drafted.foodSafetyChecked).toBeFalsy();
    expect(drafted.filterTraits?.leafType).toEqual(["broad"]);
    expect(drafted.localNames?.da).toEqual(["Udkastart"]);
    expect(drafted.localNames?.de).toEqual(["Winterlinde"]);
    expect(drafted.sources?.map((source) => source.field).sort()).toEqual([
      "carving",
      "foodSafety",
    ]);
  });

  it("never overwrites an approved card", async () => {
    const species = await createSpecies("approved");
    await runDraft(species.id);

    const untouched = await payload.findByID({
      collection: "species",
      id: species.id,
      locale: "da",
    });
    expect(untouched.status).toBe("approved");
    expect(untouched.greenCarving).toBeFalsy();
  });
});
