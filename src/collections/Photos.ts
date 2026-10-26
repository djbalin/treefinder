import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from "payload";
import { APIError } from "payload";
import { adminOr, isAdmin } from "@/access";
import {
  licenseOptions,
  type PhotoSlot,
  type PhotoStatus,
  photoSlotOptions,
  photoSourceOptions,
  photoStatusOptions,
} from "@/domain/options";
import { photosToDemote, validatePhotoChange } from "@/domain/photoRules";
import {
  rejectPhotoEndpoint,
  selectPhotoEndpoint,
} from "@/endpoints/adminActions";

/**
 * Reference photos. A candidate only holds a link and its license metadata;
 * the file is stored once the photo is selected (milestone 5).
 */
export const Photos: CollectionConfig = {
  slug: "photos",
  labels: {
    singular: { da: "Foto", en: "Photo" },
    plural: { da: "Fotos", en: "Photos" },
  },
  admin: {
    useAsTitle: "attribution",
    defaultColumns: ["species", "slot", "status", "source", "license"],
  },
  access: {
    read: adminOr({ status: { equals: "selected" } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [selectPhotoEndpoint, rejectPhotoEndpoint],
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    filesRequiredOnCreate: false,
    imageSizes: [
      { name: "thumbnail", width: 480 },
      { name: "card", width: 1200 },
    ],
  },
  hooks: {
    beforeChange: [validateChange],
    afterChange: [demoteOtherSelected],
  },
  fields: [
    {
      name: "species",
      type: "relationship",
      relationTo: "species",
      required: true,
      index: true,
      label: { da: "Art", en: "Species" },
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "candidate",
          options: photoStatusOptions,
          index: true,
          label: { da: "Status", en: "Status" },
        },
        {
          name: "slot",
          type: "select",
          options: photoSlotOptions,
          label: { da: "Plads", en: "Slot" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "source",
          type: "select",
          required: true,
          defaultValue: "upload",
          options: photoSourceOptions,
          label: { da: "Kilde", en: "Source" },
        },
        {
          name: "license",
          type: "select",
          required: true,
          options: licenseOptions,
          label: { da: "Licens", en: "License" },
        },
      ],
    },
    {
      name: "author",
      type: "text",
      required: true,
      label: { da: "Fotograf", en: "Author" },
    },
    {
      name: "attribution",
      type: "text",
      required: true,
      label: { da: "Kreditering", en: "Attribution" },
    },
    {
      name: "sourceUrl",
      type: "text",
      label: { da: "Kildeside", en: "Source page" },
    },
    {
      name: "remoteUrl",
      type: "text",
      label: { da: "Billedfil (ekstern)", en: "Image file (remote)" },
    },
    {
      name: "alt",
      type: "text",
      localized: true,
      label: { da: "Alternativ tekst", en: "Alt text" },
    },
    {
      name: "fetchedAt",
      type: "date",
      label: { da: "Hentet", en: "Fetched" },
    },
  ],
};

async function validateChange({
  data,
  originalDoc,
}: Parameters<CollectionBeforeChangeHook>[0]): Promise<
  Record<string, unknown>
> {
  const error = validatePhotoChange({
    status: (data.status ?? originalDoc?.status) as PhotoStatus | undefined,
    slot: (data.slot ?? originalDoc?.slot) as PhotoSlot | undefined,
  });
  if (error) throw new APIError(error, 400, null, true);
  return data;
}

async function demoteOtherSelected({
  doc,
  req,
}: Parameters<CollectionAfterChangeHook>[0]) {
  if (doc.status !== "selected") return doc;

  const speciesId =
    typeof doc.species === "object" ? doc.species?.id : doc.species;
  const others = await req.payload.find({
    collection: "photos",
    where: {
      species: { equals: speciesId },
      status: { equals: "selected" },
      slot: { equals: doc.slot },
    },
    depth: 0,
    pagination: false,
    req,
  });

  for (const id of photosToDemote(doc, others.docs)) {
    await req.payload.update({
      collection: "photos",
      id,
      data: { status: "candidate" },
      depth: 0,
      req,
    });
  }
  return doc;
}
