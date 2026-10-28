import { v } from "convex/values";
import { REQUIRED_PHOTO_SLOTS } from "../src/domain/options";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";

/*
 * End-to-end fixtures. Internal only: Playwright's global setup runs them
 * through `convex run`. Every fixture slug starts with "e2e-", and clearing
 * touches nothing else.
 */

const PREFIX = "e2e-";

type Fixture = {
  slug: string;
  name: string;
  latinName: string;
  isWarning?: boolean;
  warningReason?: string;
  localNames?: string[];
  filterTraits?: {
    leafType?: ("needles" | "scales" | "broad")[];
    arrangement?: ("opposite" | "alternate")[];
    leafShape?: ("simple" | "lobed" | "pinnate" | "palmate")[];
    leafEdge?: ("smooth" | "toothed" | "doubleToothed" | "spiny")[];
    bark?: ("smooth" | "peeling" | "furrowed" | "banded")[];
    thorns?: ("yes" | "no")[];
  };
};

/** Replaces all e2e fixtures with a fresh set. */
export const seedFixtures = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await clear(ctx);

    const lime = await addCard(ctx, {
      slug: `${PREFIX}lind`,
      name: "E2E lind",
      latinName: "Tilia cordata",
      localNames: ["Small-leaved lime", "linden"],
      filterTraits: {
        leafType: ["broad"],
        arrangement: ["alternate"],
        leafShape: ["simple"],
        leafEdge: ["toothed"],
        bark: ["smooth"],
        thorns: ["no"],
      },
    });
    const yew = await addCard(ctx, {
      slug: `${PREFIX}taks`,
      name: "E2E taks",
      latinName: "Taxus baccata",
      isWarning: true,
      warningReason: "Alle dele af taks er giftige.",
      filterTraits: {
        leafType: ["needles"],
        arrangement: ["alternate"],
        leafShape: ["simple"],
        leafEdge: ["smooth"],
        bark: ["peeling"],
        thorns: ["no"],
      },
    });
    await ctx.db.patch("species", lime, { lookAlikes: [yew] });
    for (const id of [lime, yew]) {
      await ctx.db.patch("species", id, { status: "published" });
    }

    // A complete card still in AI draft, and a bare draft.
    await addCard(ctx, {
      slug: `${PREFIX}klar`,
      name: "E2E klar",
      latinName: "Corylus avellana",
    });
    await ctx.db.insert("species", {
      slug: `${PREFIX}kladde`,
      name: { da: "E2E kladde" },
      latinName: "Draftus draftus",
      isWarning: false,
      launchWave: "2",
      status: "aiDraft",
    });

    await ctx.db.insert("photos", {
      speciesId: lime,
      status: "candidate",
      source: "commons",
      remoteUrl: "https://example.com/kandidat.jpg",
      sourceUrl: "https://example.com/kandidat",
      license: "CC0-1.0",
      author: "E2E",
      attribution: "E2E kandidat",
    });

    // One more bark photo in lime's gallery, and two bark candidates for
    // the photo catalog test.
    const photo = (attribution: string, status: "selected" | "candidate") =>
      ctx.db.insert("photos", {
        speciesId: lime,
        slot: "bark",
        status,
        source: "upload",
        remoteUrl: `https://example.com/${encodeURIComponent(attribution)}.jpg`,
        sourceUrl: "https://example.com/foto",
        license: "CC-BY-4.0",
        author: attribution,
        attribution,
      });
    await photo("Anden Fotograf, bark", "selected");
    await photo("E2E katalog 1", "candidate");
    await photo("E2E katalog 2", "candidate");

    for (const slug of ["whereToGetWood", "about"] as const) {
      const page = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (page) continue;
      await ctx.db.insert("pages", {
        slug,
        title: { da: slug === "about" ? "Om Treefinder" : "Skaf træ" },
        content: { da: "Testindhold." },
      });
    }
    return null;
  },
});

/** Removes every e2e fixture species and its photos. */
export const clearFixtures = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await clear(ctx);
    return null;
  },
});

async function addCard(
  ctx: MutationCtx,
  fixture: Fixture,
): Promise<Id<"species">> {
  const text = (da: string) => ({ da });
  const id = await ctx.db.insert("species", {
    slug: fixture.slug,
    name: text(fixture.name),
    latinName: fixture.latinName,
    localNames: { da: [fixture.name], en: fixture.localNames ?? [] },
    isWarning: fixture.isWarning ?? false,
    warningReason: fixture.warningReason
      ? text(fixture.warningReason)
      : undefined,
    launchWave: "launch",
    status: "aiDraft",
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
    foodSafetyCheckedAt: Date.UTC(2026, 9, 1),
    idFeatures: {
      leaf: text("Hjerteformede blade."),
      bark: text("Glat grå bark."),
    },
    filterTraits: fixture.filterTraits,
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
  });

  for (const slot of REQUIRED_PHOTO_SLOTS) {
    await ctx.db.insert("photos", {
      speciesId: id,
      slot,
      status: "selected",
      poster: true,
      source: "upload",
      license: "CC-BY-4.0",
      author: "Test Fotograf",
      attribution: `Test Fotograf, ${slot}`,
      sourceUrl: "https://example.com/foto",
      remoteUrl: "https://example.com/foto.jpg",
    });
  }
  return id;
}

async function clear(ctx: MutationCtx) {
  const species = await ctx.db
    .query("species")
    .withIndex("by_slug", (q) => q.gte("slug", PREFIX).lt("slug", "e2e."))
    .take(100);
  for (const item of species) {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_species_and_status", (q) => q.eq("speciesId", item._id))
      .take(100);
    for (const photo of photos) await ctx.db.delete("photos", photo._id);
    await ctx.db.delete("species", item._id);
  }
}
