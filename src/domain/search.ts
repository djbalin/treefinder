import type { Difficulty, Use } from "./options";

export type SearchableSpecies = {
  name: string;
  latinName: string;
  localNames: string[];
  greenCarving?: Difficulty | null;
  goodForTags?: Use[] | null;
};

export type SpeciesFilter = {
  query?: string;
  use?: Use;
  greenCarving?: Difficulty;
};

/** Lowercase, without accents, with Danish letters folded to plain ones. */
export function foldForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the query matches the Latin name or any local name. */
export function matchesQuery(
  species: SearchableSpecies,
  query: string,
): boolean {
  const needle = foldForSearch(query);
  if (!needle) return true;
  return [species.name, species.latinName, ...species.localNames].some((name) =>
    foldForSearch(name).includes(needle),
  );
}

/** Applies the species list filters (product spec §4), keeping the order. */
export function filterSpecies<T extends SearchableSpecies>(
  species: readonly T[],
  filter: SpeciesFilter,
): T[] {
  return species.filter(
    (item) =>
      (!filter.query || matchesQuery(item, filter.query)) &&
      (!filter.use || (item.goodForTags ?? []).includes(filter.use)) &&
      (!filter.greenCarving || item.greenCarving === filter.greenCarving),
  );
}
