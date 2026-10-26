import type { PhotoSlot, PhotoStatus } from "./options";

export type PhotoChange = {
  status?: PhotoStatus | null;
  slot?: PhotoSlot | null;
};

/** Danish error message when a photo change is invalid, otherwise null. */
export function validatePhotoChange(change: PhotoChange): string | null {
  if (change.status === "selected" && !change.slot) {
    return "Et valgt foto skal have en plads (hele træet, blad, bark, vinterkvist eller skåret ved).";
  }
  return null;
}

type ExistingPhoto = {
  id: number | string;
  status?: string | null;
  slot?: string | null;
};

/**
 * Photos that must go back to candidate when `selected` takes their slot:
 * each species has at most one selected photo per slot (product spec §7.2).
 */
export function photosToDemote(
  selected: { id: number | string; slot?: string | null },
  sameSpecies: readonly ExistingPhoto[],
): (number | string)[] {
  if (!selected.slot) return [];
  return sameSpecies
    .filter(
      (photo) =>
        photo.id !== selected.id &&
        photo.status === "selected" &&
        photo.slot === selected.slot,
    )
    .map((photo) => photo.id);
}
