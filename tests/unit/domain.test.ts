import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { photosToDemote, validatePhotoChange } from "@/domain/photoRules";
import { isRichTextEmpty, richTextFromParagraphs } from "@/domain/richText";
import { slugify } from "@/domain/slug";
import { parseSpeciesTable } from "@/domain/speciesList";

describe("slugify", () => {
  it("transliterates Danish letters", () => {
    expect(slugify("Småbladet lind")).toBe("smaabladet-lind");
    expect(slugify("Ægte kastanje")).toBe("aegte-kastanje");
    expect(slugify("Rødel")).toBe("roedel");
  });

  it("drops punctuation and repeated separators", () => {
    expect(slugify("  Engriflet  hvidtjørn! ")).toBe("engriflet-hvidtjoern");
  });
});

describe("isRichTextEmpty", () => {
  it("treats missing and whitespace-only values as empty", () => {
    expect(isRichTextEmpty(null)).toBe(true);
    expect(isRichTextEmpty({ root: { children: [] } })).toBe(true);
    expect(isRichTextEmpty(richTextFromParagraphs([" "]))).toBe(true);
  });

  it("finds text in nested nodes", () => {
    expect(isRichTextEmpty(richTextFromParagraphs(["", "Tekst"]))).toBe(false);
  });
});

describe("parseSpeciesTable", () => {
  const seeds = parseSpeciesTable(readFileSync("specs/species.md", "utf8"));

  it("reads every species from the spec", () => {
    expect(seeds).toHaveLength(40);
    expect(new Set(seeds.map((seed) => seed.slug)).size).toBe(40);
  });

  it("parses names, wave, warnings and look-alikes", () => {
    const lime = seeds.find((seed) => seed.latinName === "Tilia cordata");
    expect(lime).toMatchObject({
      slug: "smaabladet-lind",
      nameEn: "Small-leaved lime",
      launchWave: "launch",
    });

    const yew = seeds.find((seed) => seed.latinName === "Taxus baccata");
    expect(yew?.isWarning).toBe(true);

    const downy = seeds.find((seed) => seed.latinName === "Betula pubescens");
    expect(downy?.lookAlikeOf).toBe("silver birch");
  });

  it("has 18 launch species, 3 of them warnings", () => {
    const launch = seeds.filter((seed) => seed.launchWave === "launch");
    expect(launch).toHaveLength(18);
    expect(launch.filter((seed) => seed.isWarning)).toHaveLength(3);
  });
});

describe("photo rules", () => {
  it("requires a slot on selected photos", () => {
    expect(
      validatePhotoChange({ status: "selected", slot: null }),
    ).not.toBeNull();
    expect(
      validatePhotoChange({ status: "selected", slot: "bark" }),
    ).toBeNull();
    expect(validatePhotoChange({ status: "candidate", slot: null })).toBeNull();
  });

  it("demotes other selected photos in the same slot only", () => {
    const existing = [
      { id: 1, status: "selected", slot: "bark" },
      { id: 2, status: "selected", slot: "leaf" },
      { id: 3, status: "candidate", slot: "bark" },
      { id: 4, status: "selected", slot: "bark" },
    ];
    expect(photosToDemote({ id: 4, slot: "bark" }, existing)).toEqual([1]);
  });
});
