import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchForm } from "@/components/SearchForm";
import { SpeciesListItem } from "@/components/SpeciesListItem";
import { PageTitle } from "@/components/ui";
import {
  DIFFICULTIES,
  type Difficulty,
  difficultyOptions,
  USES,
  type Use,
  useOptions,
} from "@/domain/options";
import { filterSpecies } from "@/domain/search";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  allLocalNames,
  getPublishedSpecies,
  getSelectedPhotos,
  photosBySlot,
} from "@/lib/payload";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ q?: string; brug?: string; snit?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SpeciesList" });
  return { title: t("title") };
}

export default async function SpeciesListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q, brug, snit } = await searchParams;
  const t = await getTranslations("SpeciesList");

  const use = (USES as readonly string[]).includes(brug ?? "")
    ? (brug as Use)
    : undefined;
  const greenCarving = (DIFFICULTIES as readonly string[]).includes(snit ?? "")
    ? (snit as Difficulty)
    : undefined;

  const species = await getPublishedSpecies(locale);
  const searchable = species.map((item) => ({
    item,
    name: item.name,
    latinName: item.latinName,
    localNames: allLocalNames(item),
    greenCarving: item.greenCarving,
    goodForTags: item.goodForTags,
  }));
  const results = filterSpecies(searchable, {
    query: q,
    use,
    greenCarving,
  }).map((match) => match.item);
  const photos = await getSelectedPhotos(
    results.map((item) => item.id),
    locale,
  );

  return (
    <div className="max-w-reading space-y-6">
      <PageTitle>{t("title")}</PageTitle>
      <SearchForm locale={locale} defaultValue={q} />

      <form
        action={getPathname({ locale, href: "/arter" })}
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        {q ? <input type="hidden" name="q" value={q} /> : null}
        <label className="flex flex-col gap-1 text-sm">
          {t("filterUse")}
          <select
            name="brug"
            defaultValue={use ?? ""}
            className="rounded-control border border-line bg-surface px-2 py-1"
          >
            <option value="">{t("any")}</option>
            {useOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label[locale]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("filterGreenCarving")}
          <select
            name="snit"
            defaultValue={greenCarving ?? ""}
            className="rounded-control border border-line bg-surface px-2 py-1"
          >
            <option value="">{t("any")}</option>
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label[locale]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-control border border-line px-3 py-1"
        >
          {t("apply")}
        </button>
      </form>

      <p className="text-sm text-ink-muted" aria-live="polite">
        {t("count", { count: results.length })}
      </p>

      {results.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {results.map((item) => (
            <SpeciesListItem
              key={item.id}
              species={item}
              thumbnail={photosBySlot(photos, item.id).wholeTree}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
