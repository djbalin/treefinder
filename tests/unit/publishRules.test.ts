import { describe, expect, it } from "vitest";
import { REQUIRED_PHOTO_SLOTS } from "@/domain/options";
import {
  getPublishBlockers,
  type PublishCandidate,
} from "@/domain/publishRules";

const text = "Noget tekst.";

const complete: PublishCandidate = {
  name: "Småbladet lind",
  greenCarving: "easy",
  dryHardness: "soft",
  grainTexture: text,
  goodFor: text,
  drying: text,
  foodSafety: text,
  foodSafetyChecked: true,
  isWarning: false,
  sources: [{ title: "Kilde", url: "https://example.com", field: "general" }],
};

describe("getPublishBlockers", () => {
  it("allows a complete card with all required photos", () => {
    expect(getPublishBlockers(complete, REQUIRED_PHOTO_SLOTS)).toEqual([]);
  });

  it("requires the food safety tick", () => {
    expect(
      getPublishBlockers(
        { ...complete, foodSafetyChecked: false },
        REQUIRED_PHOTO_SLOTS,
      ),
    ).toEqual([{ rule: "foodSafetyNotChecked" }]);
  });

  it("requires a selected photo in each of the four required slots", () => {
    expect(getPublishBlockers(complete, ["wholeTree", "leaf"])).toEqual([
      { rule: "missingPhotos", slots: ["bark", "winterTwig"] },
    ]);
  });

  it("does not require the optional cut wood photo", () => {
    expect(
      getPublishBlockers(complete, ["wholeTree", "leaf", "bark", "winterTwig"]),
    ).toEqual([]);
  });

  it("requires at least one source", () => {
    expect(
      getPublishBlockers({ ...complete, sources: [] }, REQUIRED_PHOTO_SLOTS),
    ).toEqual([{ rule: "noSources" }]);
  });

  it("requires the Danish card fields, treating empty rich text as missing", () => {
    const blockers = getPublishBlockers(
      {
        ...complete,
        drying: "   ",
        greenCarving: null,
      },
      REQUIRED_PHOTO_SLOTS,
    );
    expect(blockers).toEqual([
      { rule: "missingFields", fields: ["greenCarving", "drying"] },
    ]);
  });

  it("requires a reason on warning species", () => {
    expect(
      getPublishBlockers(
        { ...complete, isWarning: true, warningReason: "" },
        REQUIRED_PHOTO_SLOTS,
      ),
    ).toEqual([{ rule: "missingWarningReason" }]);
    expect(
      getPublishBlockers(
        { ...complete, isWarning: true, warningReason: "Giftig." },
        REQUIRED_PHOTO_SLOTS,
      ),
    ).toEqual([]);
  });

  it("reports every failing rule at once", () => {
    expect(getPublishBlockers({}, []).map((blocker) => blocker.rule)).toEqual([
      "foodSafetyNotChecked",
      "missingPhotos",
      "noSources",
      "missingFields",
    ]);
  });
});
