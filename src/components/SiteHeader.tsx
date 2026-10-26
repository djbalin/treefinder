import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="mx-auto max-w-page px-2.5 pt-2.5 font-display sm:px-4">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-surface focus:p-2"
      >
        {t("skipToContent")}
      </a>
      <nav
        aria-label={t("label")}
        className="enamel flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-panel bg-accent px-4 py-3 text-accent-ink"
      >
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          {t("home")}
        </Link>
        <div className="flex flex-wrap gap-x-4">
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
    <Link href={href} className="py-1 text-base font-medium hover:underline">
      {children}
    </Link>
  );
}
