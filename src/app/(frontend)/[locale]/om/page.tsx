import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Markdown } from "@/components/Markdown";
import { PageTitle, Section } from "@/components/ui";
import type { AppLocale } from "@/i18n/routing";
import { getPage, getPublishedSpecies } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage("about", locale);
  return { title: page?.title ?? undefined };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const tDisclaimer = await getTranslations("Disclaimer");
  const page = await getPage("about", locale);
  if (!page) notFound();

  const species = await getPublishedSpecies(locale);
  const credits = species.flatMap((item) =>
    item.photos.map((photo) => ({ name: item.name, photo })),
  );

  return (
    <article className="max-w-reading space-y-8">
      <PageTitle>{page.title}</PageTitle>
      <Markdown value={page.content} />

      <Section title={t("disclaimerHeading")}>
        <p>{tDisclaimer("text")}</p>
      </Section>

      <Section title={t("creditsHeading")}>
        {credits.length === 0 ? (
          <p className="text-ink-muted">{t("noCredits")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {credits.map(({ name, photo }) => (
              <li key={photo.id}>
                {name}: {photo.attribution} ({photo.license})
                {photo.sourceUrl ? (
                  <>
                    {" "}
                    <a
                      className="underline"
                      href={photo.sourceUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("source")}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </article>
  );
}
