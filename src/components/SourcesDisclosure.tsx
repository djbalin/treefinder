import { useTranslations } from "next-intl";
import { optionLabel } from "@/domain/labels";
import { SOURCE_FIELDS, sourceFieldOptions } from "@/domain/options";
import type { AppLocale } from "@/i18n/routing";
import type { Species } from "@/payload-types";

type Source = NonNullable<Species["sources"]>[number];

/**
 * Sources, collapsed by default and grouped by the card field they support
 * (product spec §5). A native <details>, so it works without JavaScript.
 */
export function SourcesDisclosure({
  sources,
  locale,
}: {
  sources: Source[];
  locale: AppLocale;
}) {
  const t = useTranslations("Card");
  if (sources.length === 0) return null;

  const groups = SOURCE_FIELDS.map((field) => ({
    field,
    items: sources.filter((source) => source.field === field),
  })).filter((group) => group.items.length > 0);

  return (
    <details className="group border-y border-line py-3 font-label">
      <summary className="cursor-pointer font-semibold marker:text-accent hover:text-accent">
        {t("sources")} ({sources.length})
      </summary>
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.field}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              {optionLabel(sourceFieldOptions, group.field, locale)}
            </h3>
            <ul className="list-disc pl-6">
              {group.items.map((source) => (
                <li key={source.id ?? source.url}>
                  <a
                    className="text-accent underline hover:text-ink"
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
