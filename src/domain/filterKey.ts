import { FILTER_TRAITS, type FilterTrait } from "./options";

export const TRAIT_ORDER = Object.keys(FILTER_TRAITS) as FilterTrait[];

/** The trait values a species has; several per trait are allowed. */
export type SpeciesTraits = Partial<
  Record<FilterTrait, readonly string[] | null>
>;

/** What the visitor has picked; an empty or missing trait means "don't know". */
export type TraitSelection = Partial<Record<FilterTrait, readonly string[]>>;

/**
 * Product spec §6.2: within a trait any selected value matches, across traits
 * every answered trait must match, unanswered traits are ignored.
 */
export function matchesSelection(
  traits: SpeciesTraits,
  selection: TraitSelection,
): boolean {
  return TRAIT_ORDER.every((trait) => {
    const picked = selection[trait] ?? [];
    if (picked.length === 0) return true;
    const values = traits[trait] ?? [];
    return picked.some((value) => values.includes(value));
  });
}

export function filterByTraits<T extends { traits: SpeciesTraits }>(
  species: readonly T[],
  selection: TraitSelection,
): T[] {
  return species.filter((item) => matchesSelection(item.traits, selection));
}

/**
 * Up to `limit` traits that set one result apart from the other results:
 * the traits whose values the fewest other results share.
 */
export function distinguishingTraits(
  item: { traits: SpeciesTraits },
  others: readonly { traits: SpeciesTraits }[],
  limit = 2,
): { trait: FilterTrait; values: string[] }[] {
  if (others.length === 0) return [];

  const scored = TRAIT_ORDER.flatMap((trait) => {
    const values = [...(item.traits[trait] ?? [])];
    if (values.length === 0) return [];
    const sharing = others.filter((other) =>
      (other.traits[trait] ?? []).some((value) => values.includes(value)),
    ).length;
    return sharing < others.length ? [{ trait, values, sharing }] : [];
  });

  return scored
    .sort((a, b) => a.sharing - b.sharing)
    .slice(0, limit)
    .map(({ trait, values }) => ({ trait, values }));
}

/** Parses `?leafType=broad&leafType=needles&bark=smooth` style parameters. */
export function selectionFromParams(
  params: Record<string, string | string[] | undefined>,
): TraitSelection {
  const selection: TraitSelection = {};
  for (const trait of TRAIT_ORDER) {
    const raw = params[trait];
    const values = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(
      (value) => (FILTER_TRAITS[trait] as readonly string[]).includes(value),
    );
    if (values.length > 0) selection[trait] = [...new Set(values)];
  }
  return selection;
}

export function selectionToParams(selection: TraitSelection): URLSearchParams {
  const params = new URLSearchParams();
  for (const trait of TRAIT_ORDER) {
    for (const value of selection[trait] ?? []) params.append(trait, value);
  }
  return params;
}

/**
 * The launch acceptance check (product spec §6.2): with leaf type,
 * arrangement and leaf shape answered as the species itself would be, every
 * species must land in a list of at most `maxResults`. Returns the species
 * that do not, with the size of their list.
 */
export function acceptanceViolations<
  T extends { name: string; traits: SpeciesTraits },
>(
  species: readonly T[],
  maxResults = 5,
): { name: string; results: number; missingTraits: boolean }[] {
  const answered: FilterTrait[] = ["leafType", "arrangement", "leafShape"];
  return species.flatMap((item) => {
    const missingTraits = answered.some(
      (trait) => (item.traits[trait] ?? []).length === 0,
    );
    const selection = Object.fromEntries(
      answered.map((trait) => [trait, item.traits[trait] ?? []]),
    );
    const results = filterByTraits(species, selection).length;
    return missingTraits || results > maxResults
      ? [{ name: item.name, results, missingTraits }]
      : [];
  });
}
