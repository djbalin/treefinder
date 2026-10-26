import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="border-b border-line font-label">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:p-2"
      >
        {t("skipToContent")}
      </a>
      <nav
        aria-label={t("label")}
        className="mx-auto flex max-w-page flex-col gap-y-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-x-8"
      >
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t("home")}
        </Link>
        <div className="flex flex-wrap gap-x-5">
          <NavLink href="/arter">{t("species")}</NavLink>
          <NavLink href="/find-traeet">{t("filterKey")}</NavLink>
          <NavLink href="/skaf-trae">{t("getWood")}</NavLink>
          <NavLink href="/om">{t("about")}</NavLink>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: "/arter" | "/find-traeet" | "/skaf-trae" | "/om";
  children: string;
}) {
  return (
    <Link
      href={href}
      className="py-1 text-base text-ink-muted hover:text-ink hover:underline"
    >
      {children}
    </Link>
  );
}
