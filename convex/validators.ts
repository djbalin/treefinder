import { type Validator, v } from "convex/values";
import {
  CARD_STATUSES,
  DIFFICULTIES,
  FILTER_TRAITS,
  HARDNESS,
  LAUNCH_WAVES,
  LICENSES,
  PHOTO_SLOTS,
  PHOTO_SOURCES,
  PHOTO_STATUSES,
  SOURCE_FIELDS,
  USES,
} from "../src/domain/options";

/*
 * Validators built from the closed value sets in src/domain/options.ts, so
 * the app and the backend share one list of allowed values.
 */

/** A union of string literals from a closed value set. */
function literals<T extends string>(values: readonly T[]): Validator<T> {
  return v.union(
    ...values.map((value) => v.literal(value)),
  ) as unknown as Validator<T>;
}

export const cardStatus = literals(CARD_STATUSES);
export const difficulty = literals(DIFFICULTIES);
export const hardness = literals(HARDNESS);
export const use = literals(USES);
export const launchWave = literals(LAUNCH_WAVES);
export const sourceField = literals(SOURCE_FIELDS);
export const photoSlot = literals(PHOTO_SLOTS);
export const photoStatus = literals(PHOTO_STATUSES);
export const photoSource = literals(PHOTO_SOURCES);
export const license = literals(LICENSES);

export const locale = v.union(v.literal("da"), v.literal("en"));

/** Text per locale: Danish is required, English is optional. */
export const localized = v.object({
  da: v.string(),
  en: v.optional(v.string()),
});

export const localNames = v.object({
  da: v.optional(v.array(v.string())),
  sv: v.optional(v.array(v.string())),
  nb: v.optional(v.array(v.string())),
  de: v.optional(v.array(v.string())),
  nl: v.optional(v.array(v.string())),
  en: v.optional(v.array(v.string())),
});

export const idFeatures = v.object({
  leaf: v.optional(localized),
  bark: v.optional(localized),
  twig: v.optional(localized),
  shape: v.optional(localized),
  cutWood: v.optional(localized),
});

export const filterTraits = v.object({
  leafType: v.optional(v.array(literals(FILTER_TRAITS.leafType))),
  arrangement: v.optional(v.array(literals(FILTER_TRAITS.arrangement))),
  leafShape: v.optional(v.array(literals(FILTER_TRAITS.leafShape))),
  leafEdge: v.optional(v.array(literals(FILTER_TRAITS.leafEdge))),
  bark: v.optional(v.array(literals(FILTER_TRAITS.bark))),
  thorns: v.optional(v.array(literals(FILTER_TRAITS.thorns))),
});

export const source = v.object({
  title: v.string(),
  url: v.string(),
  field: sourceField,
});

export const jobKind = v.union(
  v.literal("fetchCatalog"),
  v.literal("storePhoto"),
  v.literal("draftCard"),
);

export const jobStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("done"),
  v.literal("failed"),
);
