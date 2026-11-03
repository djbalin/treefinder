import type { Doc } from "../_generated/dataModel";

/*
 * What visitors can see. Normally only published species. A development
 * deployment can set SHOW_DRAFTS=true (`npx convex env set SHOW_DRAFTS true`)
 * to show every species, whatever its status, while cards are still being
 * written. Never set it on the production deployment.
 */

export function showDrafts(): boolean {
  return process.env.SHOW_DRAFTS === "true";
}

export function isVisible(species: Doc<"species">): boolean {
  return species.status === "published" || showDrafts();
}
