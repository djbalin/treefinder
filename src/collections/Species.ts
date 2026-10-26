import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  Field,
  PayloadRequest,
} from "payload";
import { APIError } from "payload";
import { adminOr, isAdmin } from "@/access";
import {
  cardStatusOptions,
  difficultyOptions,
  FILTER_TRAITS,
  filterTraitLabels,
  filterValueLabels,
  hardnessOptions,
  launchWaveOptions,
  type PhotoSlot,
  sourceFieldOptions,
  useOptions,
} from "@/domain/options";
import {
  describeBlockers,
  getPublishBlockers,
  type PublishCandidate,
} from "@/domain/publishRules";

const localNameLanguages = [
  ["da", "Dansk"],
  ["sv", "Svensk"],
  ["nb", "Norsk"],
  ["de", "Tysk"],
  ["nl", "Hollandsk"],
  ["en", "Engelsk"],
] as const;

function richText(
  name: string,
  da: string,
  en: string,
  required = false,
): Field {
  return {
    name,
    type: "richText",
    localized: true,
    required,
    label: { da, en },
  };
}

const filterTraitFields: Field[] = (
  Object.keys(FILTER_TRAITS) as (keyof typeof FILTER_TRAITS)[]
).map((trait) => ({
  name: trait,
  type: "select",
  hasMany: true,
  label: filterTraitLabels[trait],
  options: FILTER_TRAITS[trait].map((value) => ({
    value,
    label: filterValueLabels[value] ?? { da: value, en: value },
  })),
}));

export const Species: CollectionConfig = {
  slug: "species",
  labels: {
    singular: { da: "Art", en: "Species" },
    plural: { da: "Arter", en: "Species" },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "latinName", "status", "launchWave", "updatedAt"],
    listSearchableFields: ["name", "latinName", "slug"],
  },
  versions: { maxPerDoc: 25 },
  access: {
    read: adminOr({ status: { equals: "published" } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [enforcePublishRules],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          localized: true,
          required: true,
          label: { da: "Navn", en: "Name" },
        },
        {
          name: "latinName",
          type: "text",
          required: true,
          label: { da: "Latinsk navn", en: "Latin name" },
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          label: { da: "URL-navn", en: "Slug" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "aiDraft",
          options: cardStatusOptions,
          label: { da: "Status", en: "Status" },
        },
        {
          name: "launchWave",
          type: "select",
          defaultValue: "2",
          options: launchWaveOptions,
          label: { da: "Bølge", en: "Wave" },
        },
      ],
    },
    {
      name: "reviewNotes",
      type: "textarea",
      label: { da: "Noter til gennemgang", en: "Review notes" },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: { da: "Kort", en: "Card" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "isWarning",
                  type: "checkbox",
                  label: { da: "Advarselsart", en: "Warning species" },
                },
                {
                  name: "warningReason",
                  type: "text",
                  localized: true,
                  label: { da: "Advarsel", en: "Warning" },
                  admin: { condition: (data) => Boolean(data?.isWarning) },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "greenCarving",
                  type: "select",
                  options: difficultyOptions,
                  label: { da: "Snitning (grønt træ)", en: "Carving green" },
                },
                {
                  name: "dryHardness",
                  type: "select",
                  options: hardnessOptions,
                  label: { da: "Hårdhed (tørt)", en: "Hardness when dry" },
                },
                {
                  name: "jankaN",
                  type: "number",
                  min: 0,
                  label: { da: "Janka (N)", en: "Janka (N)" },
                },
              ],
            },
            richText("grainTexture", "Ved og tekstur", "Grain and texture"),
            richText(
              "colourSmell",
              "Farve og duft (frisk)",
              "Colour and smell when fresh",
            ),
            {
              name: "goodForTags",
              type: "select",
              hasMany: true,
              options: useOptions,
              label: { da: "Velegnet til (tags)", en: "Good for (tags)" },
            },
            richText("goodFor", "Velegnet til", "Good for"),
            richText("riving", "Kløvning", "Riving and splitting"),
            richText("drying", "Tørring", "Drying"),
            richText(
              "foodSafety",
              "Fødevaresikkerhed og giftighed",
              "Food safety and toxicity",
            ),
            {
              type: "row",
              fields: [
                {
                  name: "foodSafetyChecked",
                  type: "checkbox",
                  label: {
                    da: "Fødevaresikkerhed kontrolleret mod en kilde",
                    en: "Food safety checked against a source",
                  },
                },
                {
                  name: "foodSafetyCheckedAt",
                  type: "date",
                  label: { da: "Kontrolleret dato", en: "Checked on" },
                },
              ],
            },
          ],
        },
        {
          label: { da: "Kendetegn", en: "Identification" },
          fields: [
            {
              name: "idFeatures",
              type: "group",
              label: { da: "Kendetegn", en: "Identification features" },
              fields: [
                richText("leaf", "Blad", "Leaf"),
                richText("bark", "Bark", "Bark"),
                richText("twig", "Vinterkvist og knop", "Winter twig and bud"),
                richText("shape", "Vækstform", "Overall shape"),
                richText("cutWood", "Skåret ved", "Cut wood"),
              ],
            },
            {
              name: "lookAlikes",
              type: "relationship",
              relationTo: "species",
              hasMany: true,
              label: { da: "Forveksles med", en: "Often confused with" },
            },
            {
              name: "filterTraits",
              type: "group",
              label: { da: "Træk til find-træet", en: "Filter key traits" },
              fields: filterTraitFields,
            },
          ],
        },
        {
          label: { da: "Navne og kilder", en: "Names and sources" },
          fields: [
            {
              name: "localNames",
              type: "group",
              label: { da: "Lokale navne", en: "Local names" },
              fields: localNameLanguages.map(([code, label]) => ({
                name: code,
                type: "text",
                hasMany: true,
                label,
              })),
            },
            {
              name: "sources",
              type: "array",
              label: { da: "Kilder", en: "Sources" },
              fields: [
                {
                  name: "title",
                  type: "text",
                  required: true,
                  label: { da: "Titel", en: "Title" },
                },
                { name: "url", type: "text", required: true, label: "URL" },
                {
                  name: "field",
                  type: "select",
                  required: true,
                  defaultValue: "general",
                  options: sourceFieldOptions,
                  label: { da: "Understøtter", en: "Supports" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** Non-localized fields: their incoming values apply whatever the locale. */
const NON_LOCALIZED_FIELDS = [
  "status",
  "greenCarving",
  "dryHardness",
  "foodSafetyChecked",
  "isWarning",
  "sources",
] as const;

/**
 * Blocks publishing until every rule in product spec §7.3 holds. The rules are
 * judged on the Danish card, whatever locale the edit was made in.
 */
async function enforcePublishRules({
  data,
  originalDoc,
  req,
}: Parameters<CollectionBeforeChangeHook>[0]): Promise<
  Record<string, unknown>
> {
  const status = data.status ?? originalDoc?.status;
  if (status !== "published") return data;

  const candidate = await danishCandidate(data, originalDoc, req);
  const selectedSlots = originalDoc?.id
    ? await selectedPhotoSlots(originalDoc.id, req)
    : [];
  const blockers = getPublishBlockers(candidate, selectedSlots);

  if (blockers.length > 0) {
    throw new APIError(
      `Kan ikke udgive: ${describeBlockers(blockers)}`,
      400,
      null,
      true,
    );
  }
  return data;
}

async function danishCandidate(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined,
  req: PayloadRequest,
): Promise<PublishCandidate> {
  const editingDanish = !req.locale || req.locale === "da";
  if (editingDanish) {
    return { ...originalDoc, ...data } as PublishCandidate;
  }

  const danishDoc = originalDoc?.id
    ? await req.payload.findByID({
        collection: "species",
        id: originalDoc.id as number,
        locale: "da",
        depth: 0,
        req,
      })
    : {};
  const nonLocalized = Object.fromEntries(
    NON_LOCALIZED_FIELDS.filter((field) => field in data).map((field) => [
      field,
      data[field],
    ]),
  );
  return { ...danishDoc, ...nonLocalized } as PublishCandidate;
}

async function selectedPhotoSlots(
  speciesId: number | string,
  req: PayloadRequest,
): Promise<PhotoSlot[]> {
  const photos = await req.payload.find({
    collection: "photos",
    where: {
      species: { equals: speciesId },
      status: { equals: "selected" },
    },
    depth: 0,
    limit: 50,
    pagination: false,
    req,
  });
  return photos.docs
    .map((photo) => photo.slot)
    .filter((slot): slot is PhotoSlot => Boolean(slot));
}
