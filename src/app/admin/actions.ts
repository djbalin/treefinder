"use server";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CARD_STATUSES,
  type CardStatus,
  DIFFICULTIES,
  FILTER_TRAITS,
  type FilterTrait,
  HARDNESS,
  LAUNCH_WAVES,
  PHOTO_SLOTS,
  type PhotoSlot,
  SOURCE_FIELDS,
  type SourceField,
  USES,
} from "@/domain/options";
import { adminMutation } from "@/lib/admin/convex";
import { signIn, signOut } from "@/lib/admin/session";

/** Runs an admin change, then returns to the page with a message. */
async function change(returnTo: string, work: () => Promise<unknown>) {
  let failure: string | null = null;
  try {
    await work();
  } catch (error) {
    failure =
      error instanceof ConvexError
        ? String(error.data)
        : error instanceof Error
          ? error.message
          : String(error);
  }
  revalidatePath(returnTo);
  redirect(
    failure
      ? `${returnTo}?fejl=${encodeURIComponent(failure)}`
      : `${returnTo}?gemt=1`,
  );
}

export async function signInAction(form: FormData) {
  const ok = await signIn(
    String(form.get("username") ?? ""),
    String(form.get("password") ?? ""),
  );
  redirect(ok ? "/admin" : "/admin/login?fejl=1");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/login");
}

const text = (form: FormData, name: string) =>
  String(form.get(name) ?? "").trim();

function oneOf<T extends string>(values: readonly T[], value: unknown) {
  return values.includes(value as T) ? (value as T) : null;
}

function manyOf<T extends string>(values: readonly T[], all: unknown[]) {
  return all.filter((value): value is T => values.includes(value as T));
}

export async function saveSpeciesAction(id: Id<"species">, form: FormData) {
  const returnTo = `/admin/arter/${id}`;
  const janka = Number(text(form, "jankaN"));
  const filterTraits = Object.fromEntries(
    (Object.keys(FILTER_TRAITS) as FilterTrait[]).map((trait) => [
      trait,
      manyOf(FILTER_TRAITS[trait], form.getAll(`trait_${trait}`)),
    ]),
  );
  const sources: { title: string; url: string; field: SourceField }[] = [];
  for (let index = 0; form.has(`source_url_${index}`); index++) {
    const url = text(form, `source_url_${index}`);
    const title = text(form, `source_title_${index}`);
    const field = oneOf(SOURCE_FIELDS, form.get(`source_field_${index}`));
    if (url && title && field) sources.push({ title, url, field });
  }

  await change(returnTo, () =>
    adminMutation(api.admin.species.save, {
      id,
      card: {
        name: text(form, "name"),
        latinName: text(form, "latinName"),
        isWarning: form.get("isWarning") === "on",
        warningReason: text(form, "warningReason"),
        greenCarving: oneOf(DIFFICULTIES, form.get("greenCarving")),
        dryHardness: oneOf(HARDNESS, form.get("dryHardness")),
        jankaN: Number.isFinite(janka) && janka > 0 ? Math.round(janka) : null,
        grainTexture: text(form, "grainTexture"),
        colourSmell: text(form, "colourSmell"),
        goodForTags: manyOf(USES, form.getAll("goodForTags")),
        goodFor: text(form, "goodFor"),
        riving: text(form, "riving"),
        drying: text(form, "drying"),
        foodSafety: text(form, "foodSafety"),
        foodSafetyChecked: form.get("foodSafetyChecked") === "on",
        idFeatures: {
          leaf: text(form, "id_leaf"),
          bark: text(form, "id_bark"),
          twig: text(form, "id_twig"),
          shape: text(form, "id_shape"),
          cutWood: text(form, "id_cutWood"),
        },
        filterTraits,
        sources,
        launchWave: oneOf(LAUNCH_WAVES, form.get("launchWave")) ?? "2",
        reviewNotes: text(form, "reviewNotes"),
      },
    }),
  );
}

export async function setStatusAction(id: Id<"species">, status: CardStatus) {
  if (!CARD_STATUSES.includes(status)) return;
  await change(`/admin/arter/${id}`, () =>
    adminMutation(api.admin.species.setStatus, { id, status }),
  );
}

export async function fetchPhotosAction(id: Id<"species">) {
  await change(`/admin/arter/${id}`, () =>
    adminMutation(api.admin.jobs.fetchPhotos, { speciesId: id }),
  );
}

export async function draftCardAction(id: Id<"species">) {
  await change(`/admin/arter/${id}`, () =>
    adminMutation(api.admin.jobs.draftCard, { speciesId: id }),
  );
}

export async function selectPhotoAction(
  photoId: Id<"photos">,
  slot: PhotoSlot,
  returnTo: string,
) {
  if (!PHOTO_SLOTS.includes(slot)) return;
  await change(returnTo, () =>
    adminMutation(api.admin.photos.select, { photoId, slot }),
  );
}

export async function rejectPhotoAction(
  photoId: Id<"photos">,
  returnTo: string,
) {
  await change(returnTo, () =>
    adminMutation(api.admin.photos.reject, { photoId }),
  );
}

export async function uploadPhotoAction(
  speciesId: Id<"species">,
  form: FormData,
) {
  const file = form.get("file");
  const slot = oneOf(PHOTO_SLOTS, form.get("slot"));
  await change(`/admin/arter/${speciesId}`, async () => {
    if (!(file instanceof File) || file.size === 0 || !slot) {
      throw new Error("Vælg en fil og en plads.");
    }
    const uploadUrl = await adminMutation(
      api.admin.photos.generateUploadUrl,
      {},
    );
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("Upload fejlede.");
    const { storageId } = (await response.json()) as {
      storageId: Id<"_storage">;
    };
    await adminMutation(api.admin.photos.addUpload, {
      speciesId,
      storageId,
      slot,
      author: text(form, "author"),
    });
  });
}

export async function savePageAction(
  slug: "about" | "whereToGetWood",
  form: FormData,
) {
  await change(`/admin/sider/${slug}`, () =>
    adminMutation(api.admin.pages.save, {
      slug,
      title: text(form, "title"),
      content: text(form, "content"),
    }),
  );
}
