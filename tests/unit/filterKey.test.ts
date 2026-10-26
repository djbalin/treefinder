import { describe, expect, it } from "vitest";
import {
  acceptanceViolations,
  distinguishingTraits,
  filterByTraits,
  matchesSelection,
  selectionFromParams,
  selectionToParams,
} from "@/domain/filterKey";

const lime = {
  name: "Lind",
  traits: {
    leafType: ["broad"],
    arrangement: ["alternate"],
    leafShape: ["simple"],
    bark: ["smooth", "furrowed"],
  },
};
const maple = {
  name: "Ær",
  traits: {
    leafType: ["broad"],
    arrangement: ["opposite"],
    leafShape: ["lobed"],
    bark: ["smooth"],
  },
};
const ash = {
  name: "Ask",
  traits: {
    leafType: ["broad"],
    arrangement: ["opposite"],
    leafShape: ["pinnate"],
    bark: ["furrowed"],
  },
};
const yew = {
  name: "Taks",
  traits: {
    leafType: ["needles"],
    arrangement: ["alternate"],
    leafShape: ["simple"],
    bark: ["peeling"],
  },
};
const all = [lime, maple, ash, yew];

describe("matchesSelection (product spec §6.2)", () => {
  it("ignores unanswered traits", () => {
    expect(matchesSelection(lime.traits, {})).toBe(true);
    expect(matchesSelection(lime.traits, { leafType: [] })).toBe(true);
  });

  it("matches any picked value within a trait", () => {
    expect(filterByTraits(all, { leafShape: ["lobed", "pinnate"] })).toEqual([
      maple,
      ash,
    ]);
  });

  it("requires every answered trait to match", () => {
    expect(
      filterByTraits(all, { leafType: ["broad"], arrangement: ["opposite"] }),
    ).toEqual([maple, ash]);
  });

  it("lets a species have several values for one trait", () => {
    expect(filterByTraits(all, { bark: ["furrowed"] })).toEqual([lime, ash]);
  });

  it("does not match a species with no value for an answered trait", () => {
    expect(matchesSelection({}, { leafType: ["broad"] })).toBe(false);
  });
});

describe("distinguishingTraits", () => {
  it("names the traits the fewest other results share", () => {
    expect(distinguishingTraits(yew, [lime, maple, ash])).toEqual([
      { trait: "leafType", values: ["needles"] },
      { trait: "bark", values: ["peeling"] },
    ]);
  });

  it("returns nothing when there is nothing to compare with", () => {
    expect(distinguishingTraits(yew, [])).toEqual([]);
  });
});

describe("URL parameters", () => {
  it("round-trips a selection and drops unknown values", () => {
    const selection = selectionFromParams({
      leafType: ["broad", "needles", "broad"],
      bark: "glitter",
      thorns: "no",
    });
    expect(selection).toEqual({
      leafType: ["broad", "needles"],
      thorns: ["no"],
    });
    expect(selectionToParams(selection).toString()).toBe(
      "leafType=broad&leafType=needles&thorns=no",
    );
  });
});

describe("acceptanceViolations", () => {
  it("passes when three answers narrow each species to five or fewer", () => {
    expect(acceptanceViolations(all)).toEqual([]);
  });

  it("flags species that stay in too long a list, or lack the traits", () => {
    const lookalikes = Array.from({ length: 6 }, (_, index) => ({
      ...lime,
      name: `Lind ${index}`,
    }));
    const unknown = { name: "Ukendt", traits: {} };
    const violations = acceptanceViolations([...lookalikes, unknown]);
    expect(violations).toHaveLength(7);
    expect(violations[0]).toEqual({
      name: "Lind 0",
      results: 6,
      missingTraits: false,
    });
    expect(violations.at(-1)).toMatchObject({
      name: "Ukendt",
      missingTraits: true,
    });
  });
});
