import {
  DIFFICULTIES,
  FILTER_TRAITS,
  HARDNESS,
  type SourceField,
  USES,
} from "../../domain/options";

/**
 * A card is drafted in three sections, one Claude call each, so every call
 * stays short and a cut-off run resumes at the next section (architecture
 * spec §5, runtime model).
 */
export const DRAFT_SECTIONS = ["carving", "safety", "identification"] as const;
export type DraftSection = (typeof DRAFT_SECTIONS)[number];

/** Source fields each section may cite; its old sources are replaced. */
export const SECTION_SOURCE_FIELDS: Record<DraftSection, SourceField[]> = {
  carving: [
    "carving",
    "hardness",
    "grainTexture",
    "colourSmell",
    "goodFor",
    "riving",
    "drying",
  ],
  safety: ["foodSafety"],
  identification: ["identification"],
};

const paragraphs = {
  type: "array",
  items: { type: "string" },
  description: "Danske afsnit. Hvert element er ét afsnit.",
} as const;

const sources = (fields: SourceField[]) =>
  ({
    type: "array",
    description:
      "Kilder, du faktisk har brugt. Mindst én pr. felt du udfylder.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["title", "url", "field"],
      properties: {
        title: { type: "string" },
        url: { type: "string" },
        field: { type: "string", enum: fields },
      },
    },
  }) as const;

const stringList = { type: "array", items: { type: "string" } } as const;

/** JSON schemas for the strict `submit_card` tool, per section. */
export const SECTION_SCHEMAS: Record<DraftSection, Record<string, unknown>> = {
  carving: {
    type: "object",
    additionalProperties: false,
    required: [
      "greenCarving",
      "dryHardness",
      "jankaN",
      "grainTexture",
      "colourSmell",
      "goodForTags",
      "goodFor",
      "riving",
      "drying",
      "sources",
    ],
    properties: {
      greenCarving: { type: "string", enum: DIFFICULTIES },
      dryHardness: { type: "string", enum: HARDNESS },
      jankaN: {
        type: ["number", "null"],
        description:
          "Janka-hårdhed i newton. null hvis ingen kilde angiver den.",
      },
      grainTexture: paragraphs,
      colourSmell: paragraphs,
      goodForTags: { type: "array", items: { type: "string", enum: USES } },
      goodFor: paragraphs,
      riving: paragraphs,
      drying: paragraphs,
      sources: sources(SECTION_SOURCE_FIELDS.carving),
    },
  },
  safety: {
    type: "object",
    additionalProperties: false,
    required: ["foodSafety", "warningReason", "sources"],
    properties: {
      foodSafety: paragraphs,
      warningReason: {
        type: ["string", "null"],
        description:
          "Kort advarsel (én sætning) hvis arten er giftig, ellers null.",
      },
      sources: sources(SECTION_SOURCE_FIELDS.safety),
    },
  },
  identification: {
    type: "object",
    additionalProperties: false,
    required: ["idFeatures", "filterTraits", "localNames", "sources"],
    properties: {
      idFeatures: {
        type: "object",
        additionalProperties: false,
        required: ["leaf", "bark", "twig", "shape", "cutWood"],
        properties: {
          leaf: paragraphs,
          bark: paragraphs,
          twig: paragraphs,
          shape: paragraphs,
          cutWood: paragraphs,
        },
      },
      filterTraits: {
        type: "object",
        additionalProperties: false,
        required: Object.keys(FILTER_TRAITS),
        properties: Object.fromEntries(
          Object.entries(FILTER_TRAITS).map(([trait, values]) => [
            trait,
            { type: "array", items: { type: "string", enum: values } },
          ]),
        ),
      },
      localNames: {
        type: "object",
        additionalProperties: false,
        required: ["sv", "nb", "de", "nl", "en"],
        properties: {
          sv: stringList,
          nb: stringList,
          de: stringList,
          nl: stringList,
          en: stringList,
        },
      },
      sources: sources(SECTION_SOURCE_FIELDS.identification),
    },
  },
};

/** What each section asks for, in Danish. */
export const SECTION_TASKS: Record<DraftSection, string> = {
  carving:
    "Skriv kortets snittedel: hvor let træet er at snitte grønt, hårdhed når det er tørt (med Janka-værdi hvis en kilde angiver den), ved og tekstur, farve og duft når det er friskt, hvad det er godt til, hvordan det kløver, og hvordan man tørrer det.",
  safety:
    "Skriv kortets afsnit om fødevaresikkerhed og giftighed: er veddet sikkert til skeer, skåle og andre madredskaber, er nogen dele af træet giftige, og kan støv eller saft give allergi eller irritation. Er arten giftig, skriv også en kort advarsel.",
  identification:
    "Skriv kortets kendetegn: blad, bark, vinterkvist og knop, vækstform og skåret ved. Angiv også trækkene til find-træet-nøglen og artens lokale navne på svensk, norsk, tysk, hollandsk og engelsk.",
};

export const SYSTEM_PROMPT = `Du skriver kort til Treefinder, et gratis opslagsværk for træskærere i Nord- og Vesteuropa.

Skriv på dansk, som en erfaren træskærer der hjælper en ven: du-form, praktisk og konkret, uden reklamesprog.

Brug websøgning til at finde pålidelige kilder (fx botaniske haver, skovbrugs- og træfaglige sider, anerkendte bøger og foreninger for træskærere). Skriv kun det, dine kilder understøtter. Hvis kilderne ikke siger noget om et felt, så skriv en kort sætning om det i stedet for at gætte, og angiv kun en Janka-værdi, hvis en kilde nævner den.

Vær ekstra forsigtig med fødevaresikkerhed og giftighed: er du i tvivl, så sig det tydeligt.

Når du er færdig, kalder du værktøjet submit_card præcis én gang med resultatet. Svar ikke med almindelig tekst i stedet.`;
