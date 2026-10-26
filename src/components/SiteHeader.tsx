import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { SearchForm } from "./SearchForm";

/** One slim ink bar: the site's links and, on every page, the search. */
export function SiteHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;

  return (
    <header className="bg-ink text-surface">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:p-2 focus:text-ink"
      >
        {t("skipToContent")}
      </a>
      <nav
        aria-label={t("label")}
        className="mx-auto flex max-w-page flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 font-display"
      >
        <div className="-mx-1 flex gap-x-2 overflow-x-auto">
          <NavLink href="/">{t("home")}</NavLink>
          <NavLink href="/arter">{t("species")}</NavLink>
          <NavLink href="/find-traeet">{t("filterKey")}</NavLink>
          <NavLink href="/skaf-trae">{t("getWood")}</NavLink>
          <NavLink href="/om">{t("about")}</NavLink>
        </div>
        <div className="w-full sm:ml-auto sm:w-80">
          <SearchForm locale={locale} inputId="site-search" />
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: "/" | "/arter" | "/find-traeet" | "/skaf-trae" | "/om";
  children: string;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 px-1 py-1 font-semibold whitespace-nowrap hover:underline"
    >
      {children}
    </Link>
  );
}
