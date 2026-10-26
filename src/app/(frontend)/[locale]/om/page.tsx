import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/RichText";
import { PageTitle, Section } from "@/components/ui";
import type { AppLocale } from "@/i18n/routing";
import { getPage, getPublishedSpecies, getSelectedPhotos } from "@/lib/payload";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage("about", locale);
  return { title: page.title };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const tDisclaimer = await getTranslations("Disclaimer");
  const page = await getPage("about", locale);

  const species = await getPublishedSpecies(locale);
  const nameById = new Map(species.map((item) => [item.id, item.name]));
  const photos = await getSelectedPhotos([...nameById.keys()], locale);

  return (
    <article className="space-y-8">
      <PageTitle>{page.title}</PageTitle>
      <RichText value={page.content} />

      <Section title={t("disclaimerHeading")}>
        <p>{tDisclaimer("text")}</p>
      </Section>

      <Section title={t("creditsHeading")}>
        {photos.length === 0 ? (
          <p className="text-ink-muted">{t("noCredits")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {photos.map((photo) => {
              const speciesId =
                typeof photo.species === "object"
                  ? photo.species.id
                  : photo.species;
              return (
                <li key={photo.id}>
                  {nameById.get(speciesId)}: {photo.attribution} (
                  {photo.license})
                  {photo.sourceUrl ? (
                    <>
                      {" "}
                      <a
                        className="underline"
                        href={photo.sourceUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {photo.source}
                      </a>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </article>
  );
}
