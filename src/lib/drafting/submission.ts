import {
  DIFFICULTIES,
  FILTER_TRAITS,
  HARDNESS,
  type SourceField,
  USES,
} from "@/domain/options";
import { richTextFromParagraphs } from "@/domain/richText";
import type { Species } from "@/payload-types";
import { type DraftSection, SECTION_SOURCE_FIELDS } from "./sections";

type Source = { title: string; url: string; field: SourceField };

function texts(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function oneOf<T extends string>(
  allowed: readonly T[],
  value: unknown,
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function manyOf<T extends string>(allowed: readonly T[], value: unknown): T[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter((item): item is T => allowed.includes(item as T)),
        ),
      ]
    : [];
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Sources with a title and a real URL, limited to the fields of the section. */
export function cleanSources(section: DraftSection, value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  const allowed = SECTION_SOURCE_FIELDS[section];
  return value
    .filter(
      (source): source is Source =>
        typeof source === "object" &&
        source !== null &&
        typeof source.title === "string" &&
        source.title.trim().length > 0 &&
        isHttpUrl(source.url) &&
        allowed.includes(source.field),
    )
    .map(({ title, url, field }) => ({ title: title.trim(), url, field }));
}

const richText = (value: unknown) => {
  const paragraphs = texts(value);
  return paragraphs.length > 0 ? richTextFromParagraphs(paragraphs) : null;
};

/**
 * Turns a `submit_card` call into a Danish update for the species. The tool
 * schema is strict, but every value is still checked: whatever does not fit
 * is dropped rather than stored. Sources for this section replace the old
 * ones; sources for other sections are kept.
 */
export function buildDraftUpdate(
  section: DraftSection,
  input: Record<string, unknown>,
  current: Pick<Species, "sources" | "isWarning" | "localNames">,
): Partial<Species> {
  const ownFields = SECTION_SOURCE_FIELDS[section];
  const keptSources = (current.sources ?? [])
    .filter((source) => !ownFields.includes(source.field))
    .map(({ title, url, field }) => ({ title, url, field }));
  const sources = [...keptSources, ...cleanSources(section, input.sources)];

  switch (section) {
    case "carving":
      return {
        greenCarving: oneOf(DIFFICULTIES, input.greenCarving) ?? null,
        dryHardness: oneOf(HARDNESS, input.dryHardness) ?? null,
        jankaN:
          typeof input.jankaN === "number" && input.jankaN > 0
            ? Math.round(input.jankaN)
            : null,
        grainTexture: richText(input.grainTexture),
        colourSmell: richText(input.colourSmell),
        goodForTags: manyOf(USES, input.goodForTags),
        goodFor: richText(input.goodFor),
        riving: richText(input.riving),
        drying: richText(input.drying),
        sources,
      };
    case "safety": {
      const warning =
        typeof input.warningReason === "string"
          ? input.warningReason.trim()
          : "";
      return {
        foodSafety: richText(input.foodSafety),
        // The model may flag a species as toxic, but never unflag one.
        isWarning: Boolean(current.isWarning) || warning.length > 0,
        warningReason: warning || undefined,
        sources,
      };
    }
    case "identification": {
      const features = (input.idFeatures ?? {}) as Record<string, unknown>;
      const traits = (input.filterTraits ?? {}) as Record<string, unknown>;
      const names = (input.localNames ?? {}) as Record<string, unknown>;
      return {
        idFeatures: {
          leaf: richText(features.leaf),
          bark: richText(features.bark),
          twig: richText(features.twig),
          shape: richText(features.shape),
          cutWood: richText(features.cutWood),
        },
        filterTraits: {
          leafType: manyOf(FILTER_TRAITS.leafType, traits.leafType),
          arrangement: manyOf(FILTER_TRAITS.arrangement, traits.arrangement),
          leafShape: manyOf(FILTER_TRAITS.leafShape, traits.leafShape),
          leafEdge: manyOf(FILTER_TRAITS.leafEdge, traits.leafEdge),
          bark: manyOf(FILTER_TRAITS.bark, traits.bark),
          thorns: manyOf(FILTER_TRAITS.thorns, traits.thorns),
        },
        localNames: {
          // Danish names come from the species list, not the model.
          da: current.localNames?.da ?? [],
          sv: texts(names.sv),
          nb: texts(names.nb),
          de: texts(names.de),
          nl: texts(names.nl),
          en: texts(names.en),
        },
        sources,
      };
    }
  }
}
