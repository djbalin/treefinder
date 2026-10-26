/**
 * The filter key acceptance check (product spec §6.2) against the real data:
 * with leaf type, arrangement and leaf shape answered, every launch species
 * must end up in a list of five or fewer. Run before launch:
 *
 *   pnpm check:filter-key
 */
import "dotenv/config";
import config from "@payload-config";
import { getPayload } from "payload";
import { acceptanceViolations, TRAIT_ORDER } from "@/domain/filterKey";

async function main() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "species",
    where: { launchWave: { equals: "launch" } },
    locale: "da",
    depth: 0,
    pagination: false,
  });

  const species = docs.map((item) => ({
    name: item.name,
    traits: Object.fromEntries(
      TRAIT_ORDER.map((trait) => [trait, item.filterTraits?.[trait] ?? []]),
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
