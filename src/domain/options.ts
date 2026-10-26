/**
 * Closed value sets shared by the Payload collections, the publish rules and
 * the public site. Values are stable English keys; labels are for the admin.
 */

type Option<V extends string> = {
  value: V;
  label: { da: string; en: string };
};

function options<const V extends string>(
  entries: readonly (readonly [V, string, string])[],
): Option<V>[] {
  return entries.map(([value, da, en]) => ({ value, label: { da, en } }));
}

export const CARD_STATUSES = [
  "aiDraft",
  "needsChanges",
  "approved",
  "published",
] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];
export const cardStatusOptions = options<CardStatus>([
  ["aiDraft", "AI-udkast", "AI draft"],
  ["needsChanges", "Skal rettes", "Needs changes"],
  ["approved", "Godkendt", "Approved"],
  ["published", "Udgivet", "Published"],
]);

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const difficultyOptions = options<Difficulty>([
  ["easy", "Let", "Easy"],
  ["medium", "Middel", "Medium"],
  ["hard", "Svær", "Hard"],
]);

export const HARDNESS = ["soft", "medium", "hard"] as const;
export type Hardness = (typeof HARDNESS)[number];
export const hardnessOptions = options<Hardness>([
  ["soft", "Blødt", "Soft"],
  ["medium", "Middel", "Medium"],
  ["hard", "Hårdt", "Hard"],
]);

export const USES = [
  "spoons",
  "bowls",
  "kuksa",
  "figures",
  "handles",
  "spatulas",
  "boxes",
] as const;
export type Use = (typeof USES)[number];
export const useOptions = options<Use>([
  ["spoons", "Skeer", "Spoons"],
  ["bowls", "Skåle", "Bowls"],
  ["kuksa", "Kuksa", "Kuksa"],
  ["figures", "Figurer", "Figures"],
  ["handles", "Skafter", "Handles"],
  ["spatulas", "Paletkniver og spatler", "Spatulas"],
  ["boxes", "Æsker", "Boxes"],
]);

export const LAUNCH_WAVES = ["launch", "2"] as const;
export type LaunchWave = (typeof LAUNCH_WAVES)[number];
export const launchWaveOptions = options<LaunchWave>([
  ["launch", "Lancering", "Launch"],
  ["2", "Bølge 2", "Wave 2"],
]);

/** Card fields a source can support (product spec §5). */
export const SOURCE_FIELDS = [
  "general",
  "carving",
  "hardness",
  "grainTexture",
  "colourSmell",
  "goodFor",
  "riving",
  "drying",
  "foodSafety",
  "identification",
] as const;
export type SourceField = (typeof SOURCE_FIELDS)[number];
export const sourceFieldOptions = options<SourceField>([
  ["general", "Generelt", "General"],
  ["carving", "Snitning", "Carving"],
  ["hardness", "Hårdhed", "Hardness"],
  ["grainTexture", "Ved og tekstur", "Grain and texture"],
  ["colourSmell", "Farve og duft", "Colour and smell"],
  ["goodFor", "Velegnet til", "Good for"],
  ["riving", "Kløvning", "Riving"],
  ["drying", "Tørring", "Drying"],
  ["foodSafety", "Fødevaresikkerhed", "Food safety"],
  ["identification", "Kendetegn", "Identification"],
]);

// Photos (product spec §6.1)

export const PHOTO_SLOTS = [
  "wholeTree",
  "leaf",
  "bark",
  "winterTwig",
  "cutWood",
] as const;
export type PhotoSlot = (typeof PHOTO_SLOTS)[number];
export const REQUIRED_PHOTO_SLOTS: readonly PhotoSlot[] = [
  "wholeTree",
  "leaf",
  "bark",
  "winterTwig",
];
export const photoSlotOptions = options<PhotoSlot>([
  ["wholeTree", "Hele træet", "Whole tree"],
  ["leaf", "Blad", "Leaf"],
  ["bark", "Bark", "Bark"],
  ["winterTwig", "Vinterkvist og knop", "Winter twig and bud"],
  ["cutWood", "Skåret ved", "Cut wood"],
]);

export const PHOTO_STATUSES = ["candidate", "selected", "rejected"] as const;
export type PhotoStatus = (typeof PHOTO_STATUSES)[number];
export const photoStatusOptions = options<PhotoStatus>([
  ["candidate", "Kandidat", "Candidate"],
  ["selected", "Valgt", "Selected"],
  ["rejected", "Afvist", "Rejected"],
]);

export const PHOTO_SOURCES = ["commons", "inaturalist", "upload"] as const;
export type PhotoSource = (typeof PHOTO_SOURCES)[number];
export const photoSourceOptions = options<PhotoSource>([
  ["commons", "Wikimedia Commons", "Wikimedia Commons"],
  ["inaturalist", "iNaturalist", "iNaturalist"],
  ["upload", "Egen upload", "Own upload"],
]);

/** Only commercially safe licenses (constitution, product rule 4). */
export const LICENSES = [
  "CC0-1.0",
  "CC-BY-2.0",
  "CC-BY-2.5",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-2.0",
  "CC-BY-SA-2.5",
  "CC-BY-SA-3.0",
  "CC-BY-SA-4.0",
  // iNaturalist reports licenses without a version.
  "CC-BY",
  "CC-BY-SA",
  "own",
] as const;
export type License = (typeof LICENSES)[number];
export const licenseOptions = options<License>(
  LICENSES.map(
    (value) =>
      [
        value,
        value === "own" ? "Eget foto" : value,
        value === "own" ? "Own photo" : value,
      ] as const,
  ),
);

// Filter key traits (product spec §6.2)

export const FILTER_TRAITS = {
  leafType: ["needles", "scales", "broad"],
  arrangement: ["opposite", "alternate"],
  leafShape: ["simple", "lobed", "pinnate", "palmate"],
  leafEdge: ["smooth", "toothed", "doubleToothed", "spiny"],
  bark: ["smooth", "peeling", "furrowed", "banded"],
  thorns: ["yes", "no"],
} as const;
export type FilterTrait = keyof typeof FILTER_TRAITS;
export type FilterTraitValue<T extends FilterTrait> =
  (typeof FILTER_TRAITS)[T][number];

export const filterTraitLabels: Record<
  FilterTrait,
  { da: string; en: string }
> = {
  leafType: { da: "Bladtype", en: "Leaf type" },
  arrangement: {
    da: "Blad- eller knopstilling",
    en: "Leaf or bud arrangement",
  },
  leafShape: { da: "Bladform", en: "Leaf shape" },
  leafEdge: { da: "Bladrand", en: "Leaf edge" },
  bark: { da: "Bark", en: "Bark" },
  thorns: { da: "Torne på kvistene", en: "Thorns on twigs" },
};

export const filterValueLabels: Record<string, { da: string; en: string }> = {
  needles: { da: "Nåle", en: "Needles" },
  scales: { da: "Skæl", en: "Scales" },
  broad: { da: "Løvblade", en: "Broad leaves" },
  opposite: { da: "Modsat", en: "Opposite" },
  alternate: { da: "Spredt", en: "Alternate" },
  simple: { da: "Hel", en: "Simple" },
  lobed: { da: "Lappet", en: "Lobed" },
  pinnate: { da: "Finnet", en: "Pinnate" },
  palmate: { da: "Fingret", en: "Palmate" },
  smooth: { da: "Glat", en: "Smooth" },
  toothed: { da: "Savtakket", en: "Toothed" },
  doubleToothed: { da: "Dobbelt savtakket", en: "Double-toothed" },
  spiny: { da: "Tornet", en: "Spiny" },
  peeling: { da: "Afskallende", en: "Peeling or papery" },
  furrowed: { da: "Furet eller revnet", en: "Furrowed or cracked" },
  banded: { da: "Glat med vandrette bånd", en: "Smooth with horizontal bands" },
  yes: { da: "Ja", en: "Yes" },
  no: { da: "Nej", en: "No" },
};
