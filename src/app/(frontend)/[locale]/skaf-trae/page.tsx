import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Markdown } from "@/components/Markdown";
import { PageTitle } from "@/components/ui";
import type { AppLocale } from "@/i18n/routing";
import { getPage } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage("whereToGetWood", locale);
  return { title: page?.title ?? undefined };
}

export default async function WhereToGetWoodPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await getPage("whereToGetWood", locale);
  if (!page) notFound();

  return (
    <article className="max-w-reading space-y-6">
      <PageTitle>{page.title}</PageTitle>
      <Markdown value={page.content} />
    </article>
  );
}
