import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchForm } from "@/components/SearchForm";
import { PageTitle } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="space-y-6">
      <PageTitle>{t("heading")}</PageTitle>
      <p className="text-ink-muted">{t("intro")}</p>
      <SearchForm locale={locale} />
      <ul className="space-y-2">
        <li>
          <Link href="/arter" className="underline">
            {t("browseAll")}
          </Link>
        </li>
        <li>
          <Link href="/skaf-trae" className="underline">
            {t("getWoodLink")}
          </Link>
        </li>
      </ul>
    </div>
  );
}
