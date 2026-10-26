import type { Payload, PayloadRequest } from "payload";
import { createDraftClient, type DraftClient, draftSection } from "./claude";
import type { DraftSection } from "./sections";
import { buildDraftUpdate } from "./submission";

/** Cards in these states may be (re)drafted (product spec §7.4). */
export const DRAFTABLE_STATUSES = ["aiDraft", "needsChanges"] as const;

export type DraftOutcome = { drafted: boolean; reason?: string };

/**
 * Drafts one section of a species card and saves it in Danish, before the
 * next section starts. Approved and published cards are never overwritten.
 */
export async function draftSpeciesSection(
  { payload, req }: { payload: Payload; req?: PayloadRequest },
  speciesId: number,
  section: DraftSection,
  client: DraftClient = createDraftClient(),
): Promise<DraftOutcome> {
  const species = await payload.findByID({
    collection: "species",
    id: speciesId,
    locale: "da",
    depth: 0,
    req,
  });
  if (!(DRAFTABLE_STATUSES as readonly string[]).includes(species.status)) {
    return { drafted: false, reason: `status er ${species.status}` };
  }

  const { input } = await draftSection(client, section, species);
  await payload.update({
    collection: "species",
    id: speciesId,
    locale: "da",
    data: { ...buildDraftUpdate(section, input, species), status: "aiDraft" },
    req,
  });
  return { drafted: true };
}
