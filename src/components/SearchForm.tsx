import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** Plain GET form to the species list, so search works without JavaScript. */
export async function SearchForm({
  locale,
  defaultValue,
  inputId = "q",
}: {
  locale: AppLocale;
  defaultValue?: string;
  /** Unique per page, since the header carries a search on every page. */
  inputId?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Search" });
  const action = getPathname({ locale, href: "/arter" });

  return (
    <search>
      <form
        action={action}
        method="get"
        className="flex rounded-control border-2 border-accent bg-surface"
      >
        <label htmlFor={inputId} className="sr-only">
          {t("label")}
        </label>
        <input
          id={inputId}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 bg-transparent px-3 py-1.5 font-label text-ink placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="bg-accent px-4 py-1.5 font-display font-bold text-accent-ink hover:bg-plate"
        >
          {t("submit")}
        </button>
      </form>
    </search>
  );
}
