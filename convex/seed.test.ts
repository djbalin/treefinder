/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import speciesMarkdown from "../specs/species.md?raw";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("seed", () => {
  it("creates every species from the spec, in AI draft, and both pages", async () => {
    const t = convexTest(schema, modules);
    const result = await t.mutation(internal.seed.run, { speciesMarkdown });

    expect(result).toEqual({ species: 40, created: 40, pages: 2 });
    const species = await t.run((ctx) => ctx.db.query("species").collect());
    expect(species).toHaveLength(40);
    expect(species.every((item) => item.status === "aiDraft")).toBe(true);
    expect(species.filter((item) => item.launchWave === "launch")).toHaveLength(
      18,
    );
    expect(species.filter((item) => item.isWarning)).toHaveLength(3);

    const lime = species.find((item) => item.latinName === "Tilia cordata");
    expect(lime?.slug).toBe("smaabladet-lind");
    expect(lime?.name).toEqual({
      da: "Småbladet lind",
      en: "Small-leaved lime",
    });
  });

  it("links look-alikes both ways", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.seed.run, { speciesMarkdown });

    const [downy, silver] = await t.run(async (ctx) => [
      await ctx.db
        .query("species")
        .withIndex("by_slug", (q) => q.eq("slug", "dunbirk"))
        .unique(),
      await ctx.db
        .query("species")
        .withIndex("by_slug", (q) => q.eq("slug", "vortebirk"))
        .unique(),
    ]);
    expect(downy?.lookAlikes).toContain(silver?._id);
    expect(silver?.lookAlikes).toContain(downy?._id);
  });

  it("runs twice without duplicates and keeps card content", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.seed.run, { speciesMarkdown });
    await t.run(async (ctx) => {
      const lime = await ctx.db
        .query("species")
        .withIndex("by_slug", (q) => q.eq("slug", "smaabladet-lind"))
        .unique();
      if (!lime) throw new Error("missing");
      await ctx.db.patch("species", lime._id, {
        status: "approved",
        drying: { da: "Tørrer hurtigt." },
      });
    });

    const again = await t.mutation(internal.seed.run, { speciesMarkdown });

    expect(again).toEqual({ species: 40, created: 0, pages: 0 });
    const lime = await t.run((ctx) =>
      ctx.db
        .query("species")
        .withIndex("by_slug", (q) => q.eq("slug", "smaabladet-lind"))
        .unique(),
    );
    expect(lime?.status).toBe("approved");
    expect(lime?.drying).toEqual({ da: "Tørrer hurtigt." });
    const counts = await t.run(async (ctx) => ({
      species: (await ctx.db.query("species").collect()).length,
      pages: (await ctx.db.query("pages").collect()).length,
    }));
    expect(counts).toEqual({ species: 40, pages: 2 });
  });
});
