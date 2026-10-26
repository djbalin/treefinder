import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/RichText";
import { PageTitle } from "@/components/ui";
import type { AppLocale } from "@/i18n/routing";
import { getPage } from "@/lib/payload";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage("whereToGetWood", locale);
  return { title: page.title };
}

export default async function WhereToGetWoodPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await getPage("whereToGetWood", locale);

  return (
    <article className="space-y-6">
      <PageTitle>{page.title}</PageTitle>
      <RichText value={page.content} />
    </article>
  );
}
