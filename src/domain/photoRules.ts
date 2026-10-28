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
