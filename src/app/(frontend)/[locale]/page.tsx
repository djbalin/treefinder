import { getTranslations, setRequestLocale } from "next-intl/server";
import { Glyph } from "@/components/Glyph";
import { SearchForm } from "@/components/SearchForm";
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
    <div className="-mt-4 space-y-7 sm:-mt-8">
      <section className="enamel -mx-1.5 space-y-4 rounded-panel bg-accent px-4 pt-5 pb-5 text-accent-ink sm:mx-0 sm:px-8 sm:pt-8 sm:pb-8">
        <h1 className="max-w-reading text-balance font-display text-title font-extrabold">
          {t("heading")}
        </h1>
        <p className="max-w-reading text-lg">{t("intro")}</p>
        <div className="max-w-reading">
          <SearchForm locale={locale} />
        </div>
      </section>

      <nav aria-label={t("usesLabel")} className="space-y-2">
        <h2 className="font-display text-xl font-bold">{t("usesLabel")}</h2>
        <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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

      <section aria-labelledby="trees" className="space-y-3">
        <h2 id="trees" className="sr-only">
          {t("treesLabel")}
        </h2>
        {species.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
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

      <nav className="flex flex-col gap-3 sm:flex-row">
        <Signpost href="/find-traeet">{t("filterKeyLink")}</Signpost>
        <Signpost href="/skaf-trae">{t("getWoodLink")}</Signpost>
      </nav>
    </div>
  );
}

/** A round enamel badge that filters the wall; picked badges fill. */
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
    <li className="shrink-0">
      <Link
        href={picked ? "/" : { pathname: "/", query: { brug: use } }}
        aria-current={picked ? "true" : undefined}
        className="group flex w-16 flex-col items-center gap-1 text-center font-display text-sm font-semibold"
      >
        <span
          className={`flex size-14 items-center justify-center rounded-full border-2 border-accent transition-transform duration-200 ease-out group-hover:scale-105 ${picked ? "enamel bg-accent text-accent-ink" : "bg-surface text-accent"}`}
        >
          <Glyph name={use} className="size-7" />
        </span>
        {label}
      </Link>
    </li>
  );
}

/** A wayfinding plate shaped like a trail signpost arrow. */
function Signpost({
  href,
  children,
}: {
  href: "/find-traeet" | "/skaf-trae";
  children: string;
}) {
  return (
    <Link
      href={href}
      className="enamel flex items-center justify-between gap-3 rounded-plate bg-accent py-3 pr-8 pl-4 font-display text-lg font-bold text-accent-ink [clip-path:polygon(0_0,calc(100%-1.25rem)_0,100%_50%,calc(100%-1.25rem)_100%,0_100%)] hover:bg-plate sm:min-w-80"
    >
      {children}
      <Glyph name="arrow" className="size-5 shrink-0" />
    </Link>
  );
}
