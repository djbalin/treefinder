import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilterKey, type FilterKeySpecies } from "@/components/FilterKey";
import { PageTitle } from "@/components/ui";
import { selectionFromParams, TRAIT_ORDER } from "@/domain/filterKey";
import {
  FILTER_TRAITS,
  type FilterTrait,
  filterTraitLabels,
  filterValueLabels,
} from "@/domain/options";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  getPublishedSpecies,
  getSelectedPhotos,
  photosBySlot,
} from "@/lib/payload";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FilterKey" });
  return { title: t("title") };
}

export default async function FilterKeyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FilterKey");

  const species = await getPublishedSpecies(locale);
  const photos = await getSelectedPhotos(
    species.map((item) => item.id),
    locale,
  );

  const items: FilterKeySpecies[] = species.map((item) => {
    const slots = photosBySlot(photos, item.id);
    const photo = slots.leaf ?? slots.wholeTree;
    const src = photo?.sizes?.thumbnail?.url ?? photo?.url ?? photo?.remoteUrl;
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      latinName: item.latinName,
      thumbnail: src ? { src, local: Boolean(photo?.url) } : undefined,
      traits: Object.fromEntries(
        TRAIT_ORDER.map((trait) => [trait, item.filterTraits?.[trait] ?? []]),
      ),
    };
  });

  const labels = {
    traits: Object.fromEntries(
      TRAIT_ORDER.map((trait) => [trait, filterTraitLabels[trait][locale]]),
    ) as Record<FilterTrait, string>,
    values: Object.fromEntries(
      TRAIT_ORDER.flatMap((trait) =>
        FILTER_TRAITS[trait].map((value) => [
          value,
          filterValueLabels[value]?.[locale] ?? value,
        ]),
      ),
    ),
  };

  return (
    <div className="space-y-6">
      <PageTitle>{t("title")}</PageTitle>
      <p className="text-ink-muted">{t("intro")}</p>
      <FilterKey
        species={items}
        initialSelection={selectionFromParams(await searchParams)}
        labels={labels}
        action={getPathname({ locale, href: "/find-traeet" })}
      />
    </div>
  );
}
