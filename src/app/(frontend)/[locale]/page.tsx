import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { DifficultyGlyph, Glyph, HardnessGlyph } from "@/components/Glyph";
import { TreeSign } from "@/components/TreeSign";
import { optionLabel } from "@/domain/labels";
import { USES, type Use, useOptions } from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  getPublishedSpecies,
  getSelectedPhotos,
  photosBySlot,
} from "@/lib/payload";
import type { Photo } from "@/payload-types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ brug?: string }>;
};

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { brug } = await searchParams;
  const t = await getTranslations("Home");

  const picked = (USES as readonly string[]).includes(brug ?? "")
    ? (brug as Use)
    : undefined;
  const species = (await getPublishedSpecies(locale)).filter(
    (item) => !picked || item.goodForTags?.includes(picked),
  );
  const photos = await getSelectedPhotos(
    species.map((item) => item.id),
    locale,
  );

  return (
    <div className="space-y-4">
      <h1 className="sr-only">{t("heading")}</h1>

      <nav aria-label={t("usesLabel")} className="space-y-1.5">
        <h2 className="font-display text-sm font-bold text-ink-muted">
          {t("usesLabel")}
        </h2>
        <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {USES.map((use) => (
            <UseBadge
              key={use}
              use={use}
              label={optionLabel(useOptions, use, locale)}
              picked={use === picked}
            />
          ))}
        </ul>
      </nav>

      <section aria-labelledby="trees" className="space-y-2.5">
        <h2 id="trees" className="sr-only">
          {t("treesLabel")}
        </h2>
        <BadgeLegend
          label={t("legendLabel")}
          items={[
            [
              <DifficultyGlyph key="c" value="medium" className="size-5" />,
              t("legendCarving"),
            ],
            [
              <HardnessGlyph key="h" value="medium" className="size-5" />,
              t("legendHardness"),
            ],
            [
              <Glyph key="f" name="check" className="size-5 text-plate" />,
              t("legendFood"),
            ],
          ]}
        />
        {species.length > 0 ? (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {species.map((item) => {
              const bySlot = photosBySlot(photos, item.id);
              return (
                <TreeSign
                  key={item.id}
                  species={item}
                  photo={bySlot.wholeTree ?? bySlot.leaf}
                  locale={locale}
                />
              );
            })}
          </ul>
        ) : (
          <p className="font-display text-lg">
            {t("noTrees")}{" "}
            <Link href="/" className="text-accent underline">
              {t("showAll")}
            </Link>
          </p>
        )}
      </section>

      <nav className="grid gap-1.5 pt-4 sm:grid-cols-2">
        <Signpost href="/find-traeet" route="cobalt">
          {t("filterKeyLink")}
        </Signpost>
        <Signpost href="/skaf-trae" route="green">
          {t("getWoodLink")}
        </Signpost>
      </nav>

      <PhotoCredits
        title={t("photoCredits")}
        credits={species.flatMap((item) => {
          const bySlot = photosBySlot(photos, item.id);
          const photo = bySlot.wholeTree ?? bySlot.leaf;
          return photo ? [{ name: item.name, photo }] : [];
        })}
      />
    </div>
  );
}

/** One row decoding the four badges every tree carries, in their order. */
function BadgeLegend({
  label,
  items,
}: {
  label: string;
  items: [ReactNode, string][];
}) {
  return (
    <ul
      aria-label={label}
      className="flex flex-wrap gap-x-4 gap-y-1 font-display text-sm font-semibold text-ink-muted"
    >
      {items.map(([glyph, text]) => (
        <li key={text} className="flex items-center gap-1.5">
          <span className="text-accent">{glyph}</span>
          {text}
        </li>
      ))}
    </ul>
  );
}

/** Author, license and source for every photo on the wall (constitution). */
function PhotoCredits({
  title,
  credits,
}: {
  title: string;
  credits: { name: string; photo: Photo }[];
}) {
  if (credits.length === 0) return null;
  return (
    <section className="text-sm text-ink-muted">
      <h2 className="font-display font-bold text-ink">{title}</h2>
      <p>
        {credits.map(({ name, photo }, index) => (
          <span key={photo.id}>
            {index > 0 ? " · " : null}
            {name}: {photo.attribution} (
            {photo.sourceUrl ? (
              <a
                href={photo.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="whitespace-nowrap underline hover:text-ink"
              >
                {photo.license}
              </a>
            ) : (
              photo.license
            )}
            )
          </span>
        ))}
      </p>
    </section>
  );
}

/** A compact use pill that filters the wall; the picked one fills. */
function UseBadge({
  use,
  label,
  picked,
}: {
  use: Use;
  label: string;
  picked: boolean;
}) {
  return (
    <li className="shrink-0 snap-start">
      <Link
        href={picked ? "/" : { pathname: "/", query: { brug: use } }}
        aria-current={picked ? "true" : undefined}
        className={`flex items-center gap-1.5 rounded-control border-2 border-accent py-1 pr-3 pl-2 font-display text-sm font-bold whitespace-nowrap ${picked ? "bg-accent text-accent-ink" : "text-accent hover:bg-surface-muted"}`}
      >
        <Glyph name={use} className="size-5" />
        {label}
      </Link>
    </li>
  );
}

/** A route bar to the next place, coloured like a marked forest trail. */
function Signpost({
  href,
  route,
  children,
}: {
  href: "/find-traeet" | "/skaf-trae";
  route: "cobalt" | "green";
  children: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-panel px-4 py-4 font-display text-xl font-extrabold ${route === "cobalt" ? "bg-accent text-accent-ink hover:bg-plate" : "bg-plate text-plate-ink hover:bg-accent"}`}
    >
      {children}
      <Glyph name="arrow" className="size-6 shrink-0" />
    </Link>
  );
}
