/**
 * Times one drafting call without saving anything (milestone 2 follow-up).
 *
 *   ANTHROPIC_API_KEY=... pnpm measure:draft smaabladet-lind carving
 *
 * Prints the duration, turns, token usage and the drafted section, so the
 * result can be compared with the API route's maxDuration.
 */
import "dotenv/config";
import {
  createDraftClient,
  draftSection,
  type SpeciesToDraft,
} from "@/lib/drafting/claude";
import { DRAFT_SECTIONS, type DraftSection } from "@/lib/drafting/sections";
import { convexRun } from "./convexRun";

async function main() {
  const [slug = "smaabladet-lind", sectionArg = "carving"] =
    process.argv.slice(2);
  if (!DRAFT_SECTIONS.includes(sectionArg as DraftSection)) {
    throw new Error(`Section must be one of ${DRAFT_SECTIONS.join(", ")}`);
  }
  const species = convexRun<SpeciesToDraft | null>("checks:speciesBySlug", {
    slug,
  });
  if (!species) throw new Error(`No species with slug ${slug}`);

  const started = performance.now();
  const result = await draftSection(
    createDraftClient(),
    sectionArg as DraftSection,
    species,
  );
  const seconds = ((performance.now() - started) / 1000).toFixed(1);

  console.log(
    JSON.stringify(
      {
        seconds,
        turns: result.turns,
        usage: result.usage,
        input: result.input,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
