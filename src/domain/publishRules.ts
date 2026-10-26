import { type PhotoSlot, REQUIRED_PHOTO_SLOTS } from "./options";

/** The Danish card fields that must be filled in before publishing. */
export const REQUIRED_DANISH_FIELDS = [
  "name",
  "greenCarving",
  "dryHardness",
  "grainTexture",
  "goodFor",
  "drying",
  "foodSafety",
] as const;

export type PublishCandidate = {
  name?: string | null;
  greenCarving?: string | null;
  dryHardness?: string | null;
  grainTexture?: string | null;
  goodFor?: string | null;
  drying?: string | null;
  foodSafety?: string | null;
  foodSafetyChecked?: boolean | null;
  isWarning?: boolean | null;
  warningReason?: string | null;
  sources?: unknown[] | null;
};

export type PublishBlocker =
  | { rule: "foodSafetyNotChecked" }
  | { rule: "missingPhotos"; slots: PhotoSlot[] }
  | { rule: "noSources" }
  | { rule: "missingFields"; fields: string[] }
  | { rule: "missingWarningReason" };

function isFilled(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0;
}

/**
 * Everything that stops a species from being published (product spec §7.3).
 * An empty list means it may be published. `selectedSlots` are the slots that
 * have a selected photo, `candidate` is the card in Danish.
 */
export function getPublishBlockers(
  candidate: PublishCandidate,
  selectedSlots: readonly PhotoSlot[],
): PublishBlocker[] {
  const blockers: PublishBlocker[] = [];

  if (!candidate.foodSafetyChecked) {
    blockers.push({ rule: "foodSafetyNotChecked" });
  }

  const missingSlots = REQUIRED_PHOTO_SLOTS.filter(
    (slot) => !selectedSlots.includes(slot),
  );
  if (missingSlots.length > 0) {
    blockers.push({ rule: "missingPhotos", slots: missingSlots });
  }

  if (!candidate.sources || candidate.sources.length === 0) {
    blockers.push({ rule: "noSources" });
  }

  const missingFields = REQUIRED_DANISH_FIELDS.filter(
    (field) => !isFilled(candidate[field]),
  );
  if (missingFields.length > 0) {
    blockers.push({ rule: "missingFields", fields: [...missingFields] });
  }

  if (candidate.isWarning && !isFilled(candidate.warningReason)) {
    blockers.push({ rule: "missingWarningReason" });
  }

  return blockers;
}

/** Danish messages for the admin, one line per blocker. */
export function describeBlockers(blockers: PublishBlocker[]): string {
  return blockers.map(describeBlocker).join(" ");
}

function describeBlocker(blocker: PublishBlocker): string {
  switch (blocker.rule) {
    case "foodSafetyNotChecked":
      return "Fødevaresikkerhed er ikke markeret som kontrolleret.";
    case "missingPhotos":
      return `Mangler valgt foto til: ${blocker.slots.join(", ")}.`;
    case "noSources":
      return "Kortet har ingen kilder.";
    case "missingFields":
      return `Mangler dansk tekst i: ${blocker.fields.join(", ")}.`;
    case "missingWarningReason":
      return "Advarselsart mangler en begrundelse.";
  }
}
