import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("heading")}</h1>
      <p className="text-ink-muted">{t("intro")}</p>
      <p className="text-ink-muted">{t("comingSoon")}</p>
    </section>
  );
}
