/**
 * Times one drafting call without saving anything (milestone 2 follow-up).
 *
 *   ANTHROPIC_API_KEY=... pnpm measure:draft smaabladet-lind carving
 *
 * Prints the duration, turns, token usage and the drafted section, so the
 * result can be compared with the API route's maxDuration.
 */
import "dotenv/config";
import config from "@payload-config";
import { getPayload } from "payload";
import { createDraftClient, draftSection } from "@/lib/drafting/claude";
import { DRAFT_SECTIONS, type DraftSection } from "@/lib/drafting/sections";

async function main() {
  const [slug = "smaabladet-lind", sectionArg = "carving"] =
    process.argv.slice(2);
  if (!DRAFT_SECTIONS.includes(sectionArg as DraftSection)) {
    throw new Error(`Section must be one of ${DRAFT_SECTIONS.join(", ")}`);
  }
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "species",
    where: { slug: { equals: slug } },
    locale: "da",
    limit: 1,
  });
  const species = docs[0];
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
