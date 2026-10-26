import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="border-b border-line">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:p-2"
      >
        {t("skipToContent")}
      </a>
      <nav
        aria-label={t("label")}
        className="mx-auto flex max-w-reading flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4"
      >
        <Link href="/" className="font-display text-lg font-semibold">
          {t("home")}
        </Link>
        <Link href="/arter" className="underline-offset-4 hover:underline">
          {t("species")}
        </Link>
        <Link href="/skaf-trae" className="underline-offset-4 hover:underline">
          {t("getWood")}
        </Link>
        <Link href="/om" className="underline-offset-4 hover:underline">
          {t("about")}
        </Link>
      </nav>
    </header>
  );
}
