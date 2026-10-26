import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PhotoFigure } from "@/components/PhotoFigure";
import { RichText } from "@/components/RichText";
import { SourcesDisclosure } from "@/components/SourcesDisclosure";
import { Badge, PageTitle, Section, Tag, WarningBanner } from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import {
  difficultyOptions,
  hardnessOptions,
  type PhotoSlot,
  photoSlotOptions,
  useOptions,
} from "@/domain/options";
import { isRichTextEmpty } from "@/domain/richText";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  getSelectedPhotos,
  getSpeciesBySlug,
  photosBySlot,
} from "@/lib/payload";
import type { Species } from "@/payload-types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

/** Which identification text sits next to which photo slot. */
const ID_FEATURE_BY_SLOT: Record<
  PhotoSlot,
  keyof NonNullable<Species["idFeatures"]>
> = {
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
  const photos = photosBySlot(
    await getSelectedPhotos([species.id], locale),
    species.id,
  );
  const lookAlikes = (species.lookAlikes ?? []).filter(
    (item): item is Species =>
      typeof item === "object" && item.status === "published",
  );
  const checkedOn = species.foodSafetyCheckedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(species.foodSafetyCheckedAt),
      )
    : null;

  return (
    <article className="space-y-8">
      {species.isWarning ? (
        <WarningBanner title={t("warning")}>
          {species.warningReason}
        </WarningBanner>
      ) : null}

      <header className="space-y-2">
        <PageTitle>{species.name}</PageTitle>
        <p className="italic text-ink-muted">{species.latinName}</p>
        <div className="flex flex-wrap gap-2">
          {species.greenCarving ? (
            <Badge
              label={t("greenCarving")}
              value={optionLabel(
                difficultyOptions,
                species.greenCarving,
                locale,
              )}
            />
          ) : null}
          {species.dryHardness ? (
            <Badge
              label={t("dryHardness")}
              value={
                species.jankaN
                  ? `${optionLabel(hardnessOptions, species.dryHardness, locale)} · ${t("janka", { value: species.jankaN })}`
                  : optionLabel(hardnessOptions, species.dryHardness, locale)
              }
            />
          ) : null}
        </div>
      </header>

      <PhotoFigure
        photo={photos.wholeTree}
        caption={optionLabel(photoSlotOptions, "wholeTree", locale)}
      />

      <CardText title={t("grainTexture")} value={species.grainTexture} />
      <CardText title={t("colourSmell")} value={species.colourSmell} />

      <Section title={t("goodFor")}>
        {species.goodForTags?.length ? (
          <div className="flex flex-wrap gap-1">
            {species.goodForTags.map((use) => (
              <Tag key={use}>{optionLabel(useOptions, use, locale)}</Tag>
            ))}
          </div>
        ) : null}
        <RichText value={species.goodFor} />
      </Section>

      <CardText title={t("riving")} value={species.riving} />
      <CardText title={t("drying")} value={species.drying} />

      <Section title={t("foodSafety")}>
        <RichText value={species.foodSafety} />
        {checkedOn ? (
          <p className="text-sm text-ink-muted">
            {t("checkedOn", { date: checkedOn })}
          </p>
        ) : null}
        <p className="rounded-panel border border-line bg-surface-muted p-3 text-sm">
          {tDisclaimer("text")}
        </p>
      </Section>

      <Section title={t("identification")}>
        <div className="grid gap-6 sm:grid-cols-2">
          {photoSlotOptions.map(({ value: slot, label }) =>
            slot === "wholeTree" ||
            (slot === "cutWood" &&
              !photos.cutWood &&
              isRichTextEmpty(species.idFeatures?.cutWood)) ? null : (
              <div key={slot} className="space-y-2">
                <PhotoFigure photo={photos[slot]} caption={label[locale]} />
                <RichText
                  value={species.idFeatures?.[ID_FEATURE_BY_SLOT[slot]]}
                />
              </div>
            ),
          )}
        </div>
        <RichText value={species.idFeatures?.shape} />
      </Section>

      {lookAlikes.length > 0 ? (
        <Section title={t("lookAlikes")}>
          <ul className="list-disc pl-6">
            {lookAlikes.map((other) => (
              <li key={other.id}>
                <Link
                  href={{
                    pathname: "/arter/[slug]",
                    params: { slug: other.slug },
                  }}
                  className="underline"
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
    </article>
  );
}

function CardText({ title, value }: { title: string; value: unknown }) {
  if (isRichTextEmpty(value)) return null;
  return (
    <Section title={title}>
      <RichText value={value} />
    </Section>
  );
}
