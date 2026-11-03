import type { Doc } from "../_generated/dataModel";

/*
 * Pre-launch: the public site shows every species, whatever its status, so
 * cards can be seen while they are being written. Set this to false before
 * launch (roadmap: launch checklist), and only published species are shown
 * again.
 */
export const SHOW_UNPUBLISHED = true;

/** Whether visitors may see a species with this status. */
export function visibleStatus(
  status: Doc<"species">["status"],
  showUnpublished: boolean,
): boolean {
  return showUnpublished || status === "published";
}

export function isVisible(species: Doc<"species">): boolean {
  return visibleStatus(species.status, SHOW_UNPUBLISHED);
}
