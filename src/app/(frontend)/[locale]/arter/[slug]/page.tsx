import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardKey, type KeyRow } from "@/components/CardKey";
import { Markdown } from "@/components/Markdown";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PhotoPlate, type PlateEntry } from "@/components/PhotoPlate";
import { SourcesDisclosure } from "@/components/SourcesDisclosure";
import {
  PageTitle,
  PlateNumber,
  Section,
  WarningBanner,
} from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import {
  DIFFICULTIES,
  difficultyOptions,
  filterTraitLabels,
  filterValueLabels,
  HARDNESS,
  hardnessOptions,
  type PhotoSlot,
  photoSlotOptions,
  useOptions,
} from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  galleriesBySlot,
  getSpeciesBySlug,
  photosBySlot,
  type SpeciesCard,
} from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

/** Which identification text sits next to which photo slot. */
const ID_FEATURE_BY_SLOT: Record<PhotoSlot, keyof SpeciesCard["idFeatures"]> = {
  wholeTree: "shape",
  leaf: "leaf",
  bark: "bark",
  winterTwig: "twig",
  cutWood: "cutWood",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const species = await getSpeciesBySlug(slug, locale);
  if (!species) return {};
  return { title: `${species.name} (${species.latinName})` };
}

export default async function SpeciesCardPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const species = await getSpeciesBySlug(slug, locale);
  if (!species) notFound();

  const t = await getTranslations("Card");
  const tDisclaimer = await getTranslations("Disclaimer");
  const photos = photosBySlot(species.photos);
  const galleries = galleriesBySlot(species.photos);
  const lookAlikes = species.lookAlikes;
  const checkedOn = species.foodSafetyCheckedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(species.foodSafetyCheckedAt),
      )
    : null;

  const plate: PlateEntry[] = photoSlotOptions
    .filter(
      ({ value: slot }) =>
        slot !== "cutWood" ||
        photos.cutWood ||
        Boolean(species.idFeatures.cutWood),
    )
    .map(({ value: slot, label }, index) => ({
      number: index + 1,
      slot,
      label: label[locale],
      photo: photos[slot],
    }));

  const keyRows: KeyRow[] = [];
  if (species.greenCarving) {
    keyRows.push({
      label: t("greenCarving"),
      value: optionLabel(difficultyOptions, species.greenCarving, locale),
      scale: DIFFICULTIES.indexOf(species.greenCarving) + 1,
    });
  }
  if (species.dryHardness) {
    const hardness = optionLabel(hardnessOptions, species.dryHardness, locale);
    keyRows.push({
      label: t("dryHardness"),
      value: species.jankaN ? (
        <>
          <span className="whitespace-nowrap">{hardness} ·</span>{" "}
          <span className="whitespace-nowrap">
            {t("janka", { value: species.jankaN })}
          </span>
        </>
      ) : (
        hardness
      ),
      scale: HARDNESS.indexOf(species.dryHardness) + 1,
    });
  }
  const leafTypes = species.filterTraits?.leafType ?? [];
  if (leafTypes.length > 0) {
    keyRows.push({
      label: filterTraitLabels.leafType[locale],
      value: leafTypes
        .map((value) => filterValueLabels[value][locale])
        .join(", "),
      mark: leafTypes[0],
    });
  }
  if (species.goodForTags?.length) {
    keyRows.push({
      label: t("goodFor"),
      value: species.goodForTags
        .map((use) => optionLabel(useOptions, use, locale))
        .join(", "),
    });
  }
  if (species.isWarning) {
    keyRows.push({
      label: t("foodSafetyKey"),
      value: t("toxic"),
      mark: "warning",
      tone: "warning",
    });
  } else if (species.foodSafetyChecked && checkedOn) {
    keyRows.push({
      label: t("foodSafetyKey"),
      // Keep the date on one line in the narrow key column.
      value: t("checkedOn", { date: checkedOn.replaceAll(" ", "\u00a0") }),
      mark: "check",
    });
  }

  return (
    <article className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 [grid-template-areas:'warning'_'head'_'key'_'plate'_'text'] lg:grid-cols-[var(--container-plate)_minmax(0,var(--container-reading))] lg:grid-rows-[auto_auto_auto_1fr] lg:[grid-template-areas:'warning_warning'_'plate_head'_'plate_key'_'plate_text']">
      <header className="[grid-area:head]">
        <PageTitle>{species.name}</PageTitle>
        <p className="mt-1 text-xl italic text-ink-muted">
          {species.latinName}
        </p>
      </header>

      {/* After the h1 in the outline; the grid shows it above everything. */}
      {species.isWarning ? (
        <div className="[grid-area:warning]">
          <WarningBanner title={t("warning")}>
            {species.warningReason}
          </WarningBanner>
        </div>
      ) : null}

      <div className="[grid-area:plate]">
        <div className="lg:sticky lg:top-6">
          <PhotoPlate entries={plate} />
        </div>
      </div>

      <div className="[grid-area:key]">
        <CardKey rows={keyRows} />
      </div>

      <div className="space-y-10 pt-4 [grid-area:text]">
        <CardText title={t("grainTexture")} value={species.grainTexture} />
        <CardText title={t("colourSmell")} value={species.colourSmell} />

        <CardText title={t("goodFor")} value={species.goodFor} />

        <CardText title={t("riving")} value={species.riving} />
        <CardText title={t("drying")} value={species.drying} />

        <Section title={t("foodSafety")}>
          <Markdown value={species.foodSafety} />
          {checkedOn ? (
            <p className="font-label text-sm text-ink-muted">
              {t("checkedOn", { date: checkedOn })}
            </p>
          ) : null}
          <p className="border-y border-line py-2 font-label text-sm">
            {tDisclaimer("text")}
          </p>
        </Section>

        <Section title={t("identification")}>
          <ol className="space-y-5">
            {plate.map(({ number, slot, label }) => {
              const text = species.idFeatures[ID_FEATURE_BY_SLOT[slot]];
              // The plate shows the poster; the gallery shows the rest.
              const more = (galleries[slot] ?? []).filter(
                (photo) => !photo.poster,
              );
              if (!text && more.length === 0) return null;
              return (
                <li key={slot} className="flex gap-3">
                  <PlateNumber className="mt-1 border border-accent">
                    {number}
                  </PlateNumber>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-label font-semibold">{label}</h3>
                    <Markdown value={text} />
                    <PhotoGallery
                      label={t("galleryOf", {
                        slot: label.toLocaleLowerCase(locale),
                      })}
                      photos={more}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>

        {lookAlikes.length > 0 ? (
          <Section title={t("lookAlikes")}>
            <ul className="space-y-1">
              {lookAlikes.map((other) => (
                <li key={other.id}>
                  <Link
                    href={{
                      pathname: "/arter/[slug]",
                      params: { slug: other.slug },
                    }}
                    className="font-semibold text-accent underline hover:text-ink"
                  >
                    {other.name}
                  </Link>{" "}
                  <span className="italic text-ink-muted">
                    ({other.latinName})
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <SourcesDisclosure sources={species.sources ?? []} locale={locale} />
      </div>
    </article>
  );
}

function CardText({ title, value }: { title: string; value: string | null }) {
  if (!value) return null;
  return (
    <Section title={title}>
      <Markdown value={value} />
    </Section>
  );
}
