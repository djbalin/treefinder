import { describe, expect, it } from "vitest";
import {
  filterSpecies,
  foldForSearch,
  matchesQuery,
  type SearchableSpecies,
} from "@/domain/search";

const lime: SearchableSpecies = {
  name: "Småbladet lind",
  latinName: "Tilia cordata",
  localNames: ["Småbladet lind", "Small-leaved lime", "linden", "Winterlinde"],
  greenCarving: "easy",
  goodForTags: ["spoons", "figures"],
};

const alder: SearchableSpecies = {
  name: "Rødel",
  latinName: "Alnus glutinosa",
  localNames: ["Rødel", "Common alder"],
  greenCarving: "easy",
  goodForTags: ["bowls"],
};

const oak: SearchableSpecies = {
  name: "Stilkeg",
  latinName: "Quercus robur",
  localNames: ["Stilkeg"],
  greenCarving: "hard",
  goodForTags: ["handles"],
};

describe("foldForSearch", () => {
  it("lowercases and folds Danish and accented letters", () => {
    expect(foldForSearch("  Rødel ")).toBe("rodel");
    expect(foldForSearch("Ægte kastanje")).toBe("aegte kastanje");
    expect(foldForSearch("Småbladet")).toBe("smabladet");
    expect(foldForSearch("Érable")).toBe("erable");
  });
});

describe("matchesQuery (product spec §4)", () => {
  it("finds a species by Danish, English and Latin names", () => {
    expect(matchesQuery(lime, "lind")).toBe(true);
    expect(matchesQuery(lime, "linden")).toBe(true);
    expect(matchesQuery(lime, "Tilia cordata")).toBe(true);
  });

  it("matches without Danish letters", () => {
    expect(matchesQuery(alder, "rodel")).toBe(true);
  });

  it("does not match unrelated names", () => {
    expect(matchesQuery(oak, "lind")).toBe(false);
  });
});

describe("filterSpecies", () => {
  const all = [lime, alder, oak];

  it("returns everything without filters", () => {
    expect(filterSpecies(all, {})).toEqual(all);
  });

  it("filters by use and by green carving difficulty", () => {
    expect(filterSpecies(all, { use: "bowls" })).toEqual([alder]);
    expect(filterSpecies(all, { greenCarving: "easy" })).toEqual([lime, alder]);
    expect(
      filterSpecies(all, { greenCarving: "easy", query: "tilia" }),
    ).toEqual([lime]);
  });
});
