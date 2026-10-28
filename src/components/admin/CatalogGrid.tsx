"use client";

import type { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  type CatalogResult,
  makePoster,
  moveToSlot,
  rejectFromCatalog,
  removeFromGallery,
  selectForGallery,
} from "@/app/admin/catalogActions";
import type { PhotoSlot } from "@/domain/options";
import { Glyph } from "../Glyph";

type CatalogSlot = FunctionReturnType<typeof api.admin.photos.catalog>[number];
type CatalogPhoto = CatalogSlot["selected"][number];

export type CatalogLabels = {
  gallery: string;
  candidates: string;
  noGallery: string;
  noCandidates: string;
  toggleIn: string;
  toggleOut: string;
  makePoster: string;
  isPoster: string;
  moveTo: string;
  reject: string;
  openSource: string;
  previewEmpty: string;
  keyboard: string;
};

/**
 * One slot of the photo catalog: the gallery (poster first), the
 * candidates, and a large preview of the focused photo. Built for picking
 * quickly: arrow keys move, space selects or removes, P makes the poster,
 * X rejects. The grid refreshes after each change and keeps its focus.
 */
export function CatalogGrid({
  slot,
  selected,
  candidates,
  slotOptions,
  labels,
}: {
  slot: PhotoSlot;
  selected: CatalogPhoto[];
  candidates: CatalogPhoto[];
  slotOptions: { value: PhotoSlot; label: string }[];
  labels: CatalogLabels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<Id<"photos"> | null>(
    selected[0]?.id ?? candidates[0]?.id ?? null,
  );
  const grid = useRef<HTMLDivElement>(null);
  const all = [...selected, ...candidates];
  const focused = all.find((photo) => photo.id === focusedId) ?? null;

  // Keep the keyboard focus on the same photo after a refresh moved it.
  useEffect(() => {
    if (!focusedId || !grid.current?.contains(document.activeElement)) return;
    grid.current
      .querySelector<HTMLElement>(`[data-photo="${focusedId}"]`)
      ?.focus();
  });

  function run(action: () => Promise<CatalogResult>, nextFocus?: Id<"photos">) {
    startTransition(async () => {
      const result = await action();
      setError(result.error);
      if (nextFocus) setFocusedId(nextFocus);
      router.refresh();
    });
  }

  function toggle(photo: CatalogPhoto) {
    run(() =>
      photo.status === "selected"
        ? removeFromGallery(photo.id)
        : selectForGallery(photo.id, slot),
    );
  }

  function reject(photo: CatalogPhoto) {
    const index = all.findIndex((item) => item.id === photo.id);
    const next = all[index + 1] ?? all[index - 1];
    run(() => rejectFromCatalog(photo.id), next?.id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tile = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-photo]",
    );
    if (!tile || event.metaKey || event.ctrlKey || event.altKey) return;
    const photo = all.find((item) => item.id === tile.dataset.photo);
    if (!photo) return;

    const key = event.key.toLowerCase();
    if (key.startsWith("arrow")) {
      event.preventDefault();
      nearest(tile, key)?.focus();
    } else if (key === " ") {
      event.preventDefault();
      toggle(photo);
    } else if (key === "p" && photo.status === "selected") {
      run(() => makePoster(photo.id));
    } else if (key === "x") {
      reject(photo);
    }
  }

  function nearest(tile: HTMLElement, key: string): HTMLElement | null {
    const tiles = [
      ...(grid.current?.querySelectorAll<HTMLElement>("[data-photo]") ?? []),
    ];
    const index = tiles.indexOf(tile);
    if (key === "arrowleft") return tiles[index - 1] ?? null;
    if (key === "arrowright") return tiles[index + 1] ?? null;
    const from = tile.getBoundingClientRect();
    const below = key === "arrowdown";
    const candidatesInDirection = tiles.filter((other) => {
      const box = other.getBoundingClientRect();
      return below ? box.top > from.top + 4 : box.top < from.top - 4;
    });
    const rowTop = below
      ? Math.min(
          ...candidatesInDirection.map((t) => t.getBoundingClientRect().top),
        )
      : Math.max(
          ...candidatesInDirection.map((t) => t.getBoundingClientRect().top),
        );
    return (
      candidatesInDirection
        .filter((t) => Math.abs(t.getBoundingClientRect().top - rowTop) < 4)
        .sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().left - from.left) -
            Math.abs(b.getBoundingClientRect().left - from.left),
        )[0] ?? null
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: keyboard shortcuts for the tiles inside */}
      <div
        ref={grid}
        onKeyDown={onKeyDown}
        aria-busy={pending}
        className="space-y-6"
      >
        <p className="text-sm text-ink-muted">{labels.keyboard}</p>
        {error ? (
          <p
            role="alert"
            className="rounded-panel bg-warning-surface px-3 py-2 font-semibold text-warning"
          >
            {error}
          </p>
        ) : null}
        <Section
          title={`${labels.gallery} (${selected.length})`}
          empty={labels.noGallery}
          photos={selected}
          render={(photo) => tile(photo)}
        />
        <Section
          title={`${labels.candidates} (${candidates.length})`}
          empty={labels.noCandidates}
          photos={candidates}
          render={(photo) => tile(photo)}
        />
      </div>
      <Preview photo={focused} labels={labels} />
    </div>
  );

  function tile(photo: CatalogPhoto) {
    const inGallery = photo.status === "selected";
    return (
      <article
        key={photo.id}
        data-photo={photo.id}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: each photo is a keyboard stop for the shortcuts
        tabIndex={0}
        aria-label={`${photo.attribution}${inGallery ? `, ${labels.gallery}` : ""}${photo.poster ? `, ${labels.isPoster}` : ""}`}
        onFocus={() => setFocusedId(photo.id)}
        className={`overflow-hidden rounded-panel bg-surface-muted outline-offset-2 focus:outline-3 focus:outline-accent ${inGallery ? "ring-3 ring-plate" : ""}`}
      >
        <button
          type="button"
          onClick={() => toggle(photo)}
          tabIndex={-1}
          aria-label={inGallery ? labels.toggleOut : labels.toggleIn}
          className="relative block aspect-4/3 w-full"
        >
          {photo.thumbUrl ? (
            <Image
              src={photo.thumbUrl}
              alt=""
              fill
              sizes="16rem"
              unoptimized
              className="object-cover"
            />
          ) : null}
          <span className="absolute top-1.5 left-1.5 flex gap-1">
            {inGallery ? (
              <Badge tone="plate" glyph="check" label={labels.gallery} />
            ) : null}
            {photo.poster ? (
              <Badge tone="accent" glyph="star" label={labels.isPoster} />
            ) : null}
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-1 p-1.5 text-sm">
          <SmallButton onClick={() => toggle(photo)}>
            {inGallery ? labels.toggleOut : labels.toggleIn}
          </SmallButton>
          {inGallery && !photo.poster ? (
            <SmallButton onClick={() => run(() => makePoster(photo.id))}>
              {labels.makePoster}
            </SmallButton>
          ) : null}
          <select
            tabIndex={-1}
            aria-label={labels.moveTo}
            value=""
            onChange={(event) =>
              run(() => moveToSlot(photo.id, event.target.value as PhotoSlot))
            }
            className="rounded-control border-2 border-accent bg-surface px-1 py-0.5 font-semibold text-accent"
          >
            <option value="">{labels.moveTo}</option>
            {slotOptions
              .filter((option) => option.value !== slot)
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          <SmallButton tone="warning" onClick={() => reject(photo)}>
            {labels.reject}
          </SmallButton>
        </div>
      </article>
    );
  }
}

function Section({
  title,
  empty,
  photos,
  render,
}: {
  title: string;
  empty: string;
  photos: CatalogPhoto[];
  render: (photo: CatalogPhoto) => React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {photos.length === 0 ? (
        <p className="text-ink-muted">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {photos.map(render)}
        </div>
      )}
    </section>
  );
}

function Preview({
  photo,
  labels,
}: {
  photo: CatalogPhoto | null;
  labels: CatalogLabels;
}) {
  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      {photo?.url ? (
        <figure className="space-y-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-panel bg-ink">
            <Image
              src={photo.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 30rem, 100vw"
              unoptimized
              className="object-contain"
            />
          </div>
          <figcaption className="text-sm">
            {photo.attribution} ({photo.license})
            {photo.sourceUrl ? (
              <>
                {" · "}
                <a
                  href={photo.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline"
                >
                  {labels.openSource}
                </a>
              </>
            ) : null}
          </figcaption>
        </figure>
      ) : (
        <p className="text-ink-muted">{labels.previewEmpty}</p>
      )}
    </aside>
  );
}

function Badge({
  tone,
  glyph,
  label,
}: {
  tone: "plate" | "accent";
  glyph: "check" | "star";
  label: string;
}) {
  return (
    <span
      title={label}
      className={`flex size-7 items-center justify-center rounded-full ${tone === "plate" ? "bg-plate text-plate-ink" : "bg-accent text-accent-ink"}`}
    >
      <Glyph name={glyph} className="size-4" />
    </span>
  );
}

function SmallButton({
  children,
  onClick,
  tone = "accent",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "accent" | "warning";
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      className={`rounded-control border-2 px-2 py-0.5 font-semibold ${tone === "warning" ? "border-warning text-warning hover:bg-warning-surface" : "border-accent text-accent hover:bg-surface"}`}
    >
      {children}
    </button>
  );
}
