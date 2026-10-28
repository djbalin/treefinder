import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchCatalogAction, uploadPhotoAction } from "@/app/admin/actions";
import { CatalogGrid } from "@/components/admin/CatalogGrid";
import { Button, Notice, TextField } from "@/components/admin/forms";
import { RefreshWhile } from "@/components/admin/RefreshWhile";
import { PageTitle } from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import {
  PHOTO_SLOTS,
  type PhotoSlot,
  photoSlotOptions,
} from "@/domain/options";
import { adminQuery } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";

const CATALOG_SLOTS = ["wholeTree", "bark", "leaf"] as const;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ plads?: string; gemt?: string; fejl?: string }>;
};

/** One species' photo catalog: a tab per slot for curating its gallery. */
export default async function PhotoCatalogPage({
  params,
  searchParams,
}: Props) {
  const { id: rawId } = await params;
  const id = rawId as Id<"species">;
  const { plads, fejl } = await searchParams;
  const slot: PhotoSlot = PHOTO_SLOTS.includes(plads as PhotoSlot)
    ? (plads as PhotoSlot)
    : "wholeTree";
  const t = await getTranslations("Admin");

  const data = await adminQuery(api.admin.species.get, { id });
  if (!data) notFound();
  const catalog = await adminQuery(api.admin.photos.catalog, {
    speciesId: id,
  });
  const current = catalog.find((group) => group.slot === slot);
  const fetching = data.jobs.some(
    (job) =>
      job.kind === "fetchCatalog" &&
      (job.status === "queued" || job.status === "running"),
  );
  const returnTo = `/admin/arter/${id}/fotos?plads=${slot}`;
  const catalogSlot = (CATALOG_SLOTS as readonly string[]).includes(slot)
    ? (slot as (typeof CATALOG_SLOTS)[number])
    : undefined;
  const slotLabel = (value: PhotoSlot) =>
    optionLabel(photoSlotOptions, value, "da");

  return (
    <div className="space-y-6">
      <RefreshWhile active={fetching} />
      <div className="space-y-2">
        <Link
          href={`/admin/arter/${id}`}
          className="text-accent hover:underline"
        >
          ← {data.species.name.da}
        </Link>
        <PageTitle>{t("catalogTitle")}</PageTitle>
        <Notice error={fejl} savedText={t("saved")} />
        {fetching ? (
          <p role="status" className="font-semibold text-accent">
            {t("fetching")}
          </p>
        ) : null}
      </div>

      <nav aria-label={t("catalogTitle")} className="flex flex-wrap gap-2">
        {catalog.map((group) => (
          <Link
            key={group.slot}
            href={`/admin/arter/${id}/fotos?plads=${group.slot}`}
            aria-current={group.slot === slot ? "page" : undefined}
            className={`rounded-control border-2 border-accent px-3 py-1.5 font-display font-bold ${group.slot === slot ? "bg-accent text-accent-ink" : "text-accent hover:bg-surface-muted"}`}
          >
            {slotLabel(group.slot)}{" "}
            <span className="font-normal tabular-nums">
              {group.selected.length}/
              {group.selected.length + group.candidates.length}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        {catalogSlot ? (
          <form
            action={fetchCatalogAction.bind(null, id, catalogSlot, returnTo)}
          >
            <Button tone="quiet">{t("fetchMore")}</Button>
          </form>
        ) : null}
        <form action={fetchCatalogAction.bind(null, id, undefined, returnTo)}>
          <Button tone="quiet">{t("fetchCatalog")}</Button>
        </form>
        {current?.exhausted ? (
          <span className="text-sm text-ink-muted">{t("exhausted")}</span>
        ) : null}
      </div>

      <CatalogGrid
        key={slot}
        slot={slot}
        selected={current?.selected ?? []}
        candidates={current?.candidates ?? []}
        slotOptions={PHOTO_SLOTS.map((value) => ({
          value,
          label: slotLabel(value),
        }))}
        labels={{
          gallery: t("gallery"),
          candidates: t("candidatesTitle"),
          noGallery: t("noGallery"),
          noCandidates: t("noCatalogCandidates"),
          toggleIn: t("toggleIn"),
          toggleOut: t("toggleOut"),
          makePoster: t("makePoster"),
          isPoster: t("isPoster"),
          moveTo: t("moveTo"),
          reject: t("reject"),
          openSource: t("openSource"),
          previewEmpty: t("previewEmpty"),
          keyboard: t("catalogKeyboard"),
        }}
      />

      <form
        action={uploadPhotoAction.bind(null, id, returnTo)}
        className="flex flex-wrap items-end gap-3 border-t-2 border-accent pt-4"
      >
        <label className="block space-y-1 font-display font-semibold">
          <span>{t("uploadHeading")}</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            className="block font-body font-normal"
          />
        </label>
        <input type="hidden" name="slot" value={slot} />
        <TextField label={t("author")} name="author" />
        <Button tone="quiet">{t("upload")}</Button>
      </form>
    </div>
  );
}
