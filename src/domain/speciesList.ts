import type { LaunchWave } from "./options";
import { slugify } from "./slug";

export type SpeciesSeed = {
  slug: string;
  nameDa: string;
  latinName: string;
  nameEn: string;
  launchWave: LaunchWave;
  isWarning: boolean;
  /** English name (as written in the spec) of the species this one is a look-alike of. */
  lookAlikeOf?: string;
};

/**
 * Parses the species table in `specs/species.md` (Danish | Latin | English |
 * Wave | Note) into seed records. The spec file is the source of truth for
 * the species list.
 */
export function parseSpeciesTable(markdown: string): SpeciesSeed[] {
  const rows = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map((line) =>
      line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    );

  // Skip the header row and the separator row.
  const dataRows = rows.filter(
    (cells) => cells[0] !== "Danish" && !/^-+$/.test(cells[0] ?? ""),
  );

  return dataRows.map((cells) => {
    const [nameDa = "", latinRaw = "", nameEn = "", wave = "", note = ""] =
      cells;
    const lookAlike = /^Look-alike of (.+)$/i.exec(note);

    return {
      slug: slugify(nameDa),
      nameDa,
      latinName: latinRaw.replace(/^[_*]+|[_*]+$/g, ""),
      nameEn,
      launchWave: wave.toLowerCase() === "launch" ? "launch" : "2",
      isWarning: /^warning/i.test(note),
      lookAlikeOf: lookAlike?.[1]?.trim(),
    };
  });
}
