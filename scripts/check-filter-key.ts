/**
 * The filter key acceptance check (product spec §6.2) against the real data:
 * with leaf type, arrangement and leaf shape answered, every launch species
 * must end up in a list of five or fewer. Run before launch:
 *
 *   pnpm check:filter-key
 */
import { acceptanceViolations, TRAIT_ORDER } from "@/domain/filterKey";
import type { FilterTrait } from "@/domain/options";
import { convexRun } from "./convexRun";

async function main() {
  const launch = convexRun<
    { name: string; traits: Partial<Record<FilterTrait, string[]>> }[]
  >("checks:launchTraits");

  const species = launch.map((item) => ({
    name: item.name,
    traits: Object.fromEntries(
      TRAIT_ORDER.map((trait) => [trait, item.traits[trait] ?? []]),
    ),
  }));
  const violations = acceptanceViolations(species);

  if (violations.length === 0) {
    console.log(
      `All ${species.length} launch species pass the filter key check.`,
    );
    process.exit(0);
  }
  for (const violation of violations) {
    console.log(
      violation.missingTraits
        ? `${violation.name}: missing leaf type, arrangement or leaf shape`
        : `${violation.name}: ${violation.results} results (max 5)`,
    );
  }
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
