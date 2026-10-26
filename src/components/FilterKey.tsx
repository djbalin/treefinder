"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  distinguishingTraits,
  filterByTraits,
  type SpeciesTraits,
  selectionToParams,
  TRAIT_ORDER,
  type TraitSelection,
} from "@/domain/filterKey";
import { FILTER_TRAITS, type FilterTrait } from "@/domain/options";
import { Link } from "@/i18n/navigation";

export type FilterKeySpecies = {
  id: string;
  slug: string;
  name: string;
  latinName: string;
  thumbnail?: { src: string; local: boolean };
  traits: SpeciesTraits;
};

type Labels = {
  traits: Record<FilterTrait, string>;
  values: Record<string, string>;
};

/**
 * The filter key (product spec §6.2). Results update as traits are picked;
 * without JavaScript the same form submits as a GET request.
 */
export function FilterKey({
  species,
  initialSelection,
  labels,
  action,
}: {
  species: FilterKeySpecies[];
  initialSelection: TraitSelection;
  labels: Labels;
  action: string;
}) {
  const t = useTranslations("FilterKey");
  const [selection, setSelection] = useState<TraitSelection>(initialSelection);
  const results = useMemo(
    () => filterByTraits(species, selection),
    [species, selection],
  );

  function toggle(trait: FilterTrait, value: string, checked: boolean) {
    const current = selection[trait] ?? [];
    const next = {
      ...selection,
      [trait]: checked
        ? [...current, value]
        : current.filter((item) => item !== value),
    };
    setSelection(next);
    const query = selectionToParams(next).toString();
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }

  function reset() {
    setSelection({});
    window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <div className="space-y-6">
      <form action={action} method="get" className="space-y-4">
        {TRAIT_ORDER.map((trait) => (
          <fieldset key={trait} className="space-y-2">
            <legend className="font-semibold">{labels.traits[trait]}</legend>
            <div className="flex flex-wrap gap-2">
              {FILTER_TRAITS[trait].map((value) => {
                const checked = (selection[trait] ?? []).includes(value);
                return (
                  <label
                    key={value}
                    className="cursor-pointer rounded-control border border-line px-3 py-1 text-sm has-checked:bg-accent has-checked:text-accent-ink has-focus-visible:outline-2"
                  >
                    <input
                      type="checkbox"
                      name={trait}
                      value={value}
                      checked={checked}
                      onChange={(event) =>
                        toggle(trait, value, event.currentTarget.checked)
                      }
                      className="sr-only"
                    />
                    {labels.values[value] ?? value}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <p className="text-sm text-ink-muted">{t("winterHint")}</p>
        <div className="flex gap-3">
          <noscript>
            <button
              type="submit"
              className="rounded-control bg-accent px-4 py-2 text-accent-ink"
            >
              {t("submit")}
            </button>
          </noscript>
          <button
            type="button"
            onClick={reset}
            className="rounded-control border border-line px-4 py-2"
          >
            {t("reset")}
          </button>
        </div>
      </form>

      <section aria-labelledby="filter-results" className="space-y-3">
        <h2
          id="filter-results"
          className="font-display text-xl font-semibold"
          aria-live="polite"
        >
          {t("results", { count: results.length })}
        </h2>
        <ul className="divide-y divide-line">
          {results.map((item) => (
            <li key={item.id} className="flex gap-4 py-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-panel bg-surface-muted">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail.src}
                    alt=""
                    width={128}
                    height={128}
                    unoptimized={!item.thumbnail.local}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-1">
                <Link
                  href={{
                    pathname: "/arter/[slug]",
                    params: { slug: item.slug },
                  }}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm italic text-ink-muted">
                  {item.latinName}
                </p>
                <p className="text-sm">
                  {distinguishingTraits(
                    item,
                    results.filter((other) => other.id !== item.id),
                  )
                    .map(
                      ({ trait, values }) =>
                        `${labels.traits[trait]}: ${values.map((value) => labels.values[value] ?? value).join(", ")}`,
                    )
                    .join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
