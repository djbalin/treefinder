import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** Plain GET form to the species list, so search works without JavaScript. */
export async function SearchForm({
  locale,
  defaultValue,
}: {
  locale: AppLocale;
  defaultValue?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Search" });
  const action = getPathname({ locale, href: "/arter" });

  return (
    <search>
      <form
        action={action}
        method="get"
        className="flex rounded-control border-2 border-accent bg-surface p-1"
      >
        <label htmlFor="q" className="sr-only">
          {t("label")}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 rounded-control bg-transparent px-3 py-2 text-ink placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="rounded-control bg-action px-5 py-2 font-display font-bold text-action-ink hover:bg-surface"
        >
          {t("submit")}
        </button>
      </form>
    </search>
  );
}
