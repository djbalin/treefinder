import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { rejectPhotoAction, selectPhotoAction } from "@/app/admin/actions";
import { optionLabel } from "@/domain/labels";
import { PHOTO_SLOTS, photoSlotOptions } from "@/domain/options";
import { isOptimizable } from "@/lib/content";

export type AdminPhoto = FunctionReturnType<
  typeof api.admin.photos.forSpecies
>[number];

/**
 * One photo with its credit and the review actions: a button per slot
 * (keyboard 1–5 in the review queue) and reject (X).
 */
export async function PhotoCard({
  photo,
  returnTo,
}: {
  photo: AdminPhoto;
  returnTo: string;
}) {
  const t = await getTranslations("Admin");

  return (
    <article
      aria-label={photo.attribution}
      data-photo={photo.id}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focus target for the 1–5 and X shortcuts
      tabIndex={0}
      className={`space-y-2 rounded-panel p-2 focus:outline-2 focus:outline-accent ${photo.status === "selected" ? "bg-plate text-plate-ink" : "bg-surface-muted"}`}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-panel bg-surface">
        {photo.url ? (
          <Image
            src={photo.url}
            alt=""
            fill
            sizes="16rem"
            unoptimized={!isOptimizable(photo.url)}
            className="object-cover"
          />
        ) : null}
      </div>
      <p className="text-sm">
        {photo.slot
          ? `${optionLabel(photoSlotOptions, photo.slot, "da")} · `
          : null}
        {photo.attribution} ({photo.license}) ·{" "}
        {photo.stored ? t("stored") : t("notStored")}
      </p>
      <div className="flex flex-wrap gap-1">
        {PHOTO_SLOTS.map((slot, index) => (
          <form
            key={slot}
            action={selectPhotoAction.bind(null, photo.id, slot, returnTo)}
          >
            <button
              type="submit"
              data-shortcut={index + 1}
              className="rounded-control border-2 border-accent bg-surface px-2 py-0.5 text-sm font-semibold text-accent hover:bg-surface-muted"
            >
              {index + 1} {optionLabel(photoSlotOptions, slot, "da")}
            </button>
          </form>
        ))}
        <form action={rejectPhotoAction.bind(null, photo.id, returnTo)}>
          <button
            type="submit"
            data-shortcut="x"
            className="rounded-control border-2 border-warning bg-surface px-2 py-0.5 text-sm font-semibold text-warning hover:bg-warning-surface"
          >
            X {t("reject")}
          </button>
        </form>
      </div>
    </article>
  );
}
