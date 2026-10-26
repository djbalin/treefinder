/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

type Status = "aiDraft" | "needsChanges" | "approved" | "published";

async function setup() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const add = (slug: string, status: Status) =>
      ctx.db.insert("species", {
        slug,
        name: { da: `${slug} da`, en: `${slug} en` },
        latinName: `${slug} latin`,
        isWarning: false,
        launchWave: "launch",
        status,
        drying: { da: "Tørrer hurtigt." },
      });
    const lime = await add("lind", "published");
    const draft = await add("kladde", "aiDraft");
    const approved = await add("godkendt", "approved");
    await ctx.db.patch("species", lime, { lookAlikes: [draft, approved] });

    const photo = (
      speciesId: Id<"species">,
      status: "candidate" | "selected" | "rejected",
      slot: "leaf" | "bark",
    ) =>
      ctx.db.insert("photos", {
        speciesId,
        status,
        slot,
        source: "commons",
        remoteUrl: `https://upload.wikimedia.org/${status}-${slot}.jpg`,
        author: "Fotograf",
        license: "CC-BY-4.0",
        attribution: `Fotograf, ${status}`,
      });
    await photo(lime, "selected", "leaf");
    await photo(lime, "candidate", "bark");
    await photo(lime, "rejected", "bark");
    await photo(draft, "selected", "leaf");
    return { lime, draft, approved };
  });
  return { t, ids };
}

describe("visitor access", () => {
  it("lists only published species", async () => {
    const { t } = await setup();
    const list = await t.query(api.species.listPublished, { locale: "da" });
    expect(list.map((item) => item.slug)).toEqual(["lind"]);
  });

  it("returns only selected photos", async () => {
    const { t } = await setup();
    const [lime] = await t.query(api.species.listPublished, { locale: "da" });
    expect(lime?.photos.map((photo) => photo.attribution)).toEqual([
      "Fotograf, selected",
    ]);
  });

  it("hides unpublished cards and unpublished look-alikes", async () => {
    const { t } = await setup();
    expect(
      await t.query(api.species.getPublishedBySlug, {
        slug: "kladde",
        locale: "da",
      }),
    ).toBeNull();

    const card = await t.query(api.species.getPublishedBySlug, {
      slug: "lind",
      locale: "da",
    });
    expect(card?.name).toBe("lind da");
    expect(card?.drying).toBe("Tørrer hurtigt.");
    expect(card?.lookAlikes).toEqual([]);
  });

  it("falls back to Danish when English text is missing", async () => {
    const { t } = await setup();
    const card = await t.query(api.species.getPublishedBySlug, {
      slug: "lind",
      locale: "en",
    });
    expect(card?.name).toBe("lind en");
    expect(card?.drying).toBe("Tørrer hurtigt.");
  });

  it("returns pages, and null for a page that does not exist", async () => {
    const t = convexTest(schema, modules);
    expect(
      await t.query(api.pages.get, { slug: "about", locale: "da" }),
    ).toBeNull();
    await t.run((ctx) =>
      ctx.db.insert("pages", {
        slug: "about",
        title: { da: "Om", en: "About" },
        content: { da: "Tekst." },
      }),
    );
    expect(
      await t.query(api.pages.get, { slug: "about", locale: "en" }),
    ).toEqual({ title: "About", content: "Tekst." });
  });
});
