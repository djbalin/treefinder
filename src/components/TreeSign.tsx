import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { optionLabel } from "@/domain/labels";
import {
  difficultyOptions,
  filterTraitLabels,
  filterValueLabels,
  hardnessOptions,
} from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Photo, Species } from "@/payload-types";
import { DifficultyGlyph, Glyph, HardnessGlyph } from "./Glyph";

/**
 * One tree on the home page wall: its photo with an enamel name plate and
 * a fixed row of round badges (green carving, dry hardness, food safety,
 * leaf type), always in that order so trees compare at a glance.
 */
export function TreeSign({
  species,
  photo,
  locale,
}: {
  species: Species;
  photo?: Photo;
  locale: AppLocale;
}) {
  const t = useTranslations("Card");
  const tHome = useTranslations("Home");
  const src =
    photo?.sizes?.card?.url ?? photo?.url ?? photo?.remoteUrl ?? undefined;
  const leafType = species.filterTraits?.leafType?.[0];

  const badges: { key: string; label: string; glyph: ReactNode }[] = [];
  if (species.greenCarving) {
    badges.push({
      key: "carving",
      label: `${t("greenCarving")}: ${optionLabel(difficultyOptions, species.greenCarving, locale)}`,
      glyph: (
        <DifficultyGlyph value={species.greenCarving} className="size-5" />
      ),
    });
  }
  if (species.dryHardness) {
    badges.push({
      key: "hardness",
      label: `${t("dryHardness")}: ${optionLabel(hardnessOptions, species.dryHardness, locale)}`,
      glyph: <HardnessGlyph value={species.dryHardness} className="size-5" />,
    });
  }
  badges.push(
    species.isWarning
      ? {
          key: "food",
          label: t("toxic"),
          glyph: <Glyph name="warning" className="size-5 text-warning" />,
        }
      : {
          key: "food",
          label: species.foodSafetyChecked
            ? tHome("foodSafe")
            : tHome("foodUnchecked"),
          glyph: <Glyph name="check" className="size-5" />,
        },
  );
  if (leafType) {
    badges.push({
      key: "leaf",
      label: `${filterTraitLabels.leafType[locale]}: ${filterValueLabels[leafType][locale]}`,
      glyph: <Glyph name={leafType} className="size-5" />,
    });
  }

  return (
    <li>
      <Link
        href={{ pathname: "/arter/[slug]", params: { slug: species.slug } }}
        className="group relative block aspect-3/4 overflow-hidden rounded-panel bg-surface-muted"
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 33vw, 50vw"
            unoptimized={!photo?.url}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <p className="p-4 font-display text-sm text-ink-muted">
            {tHome("noPhoto")}
          </p>
        )}
        <div
          className={`enamel absolute inset-x-2 bottom-2 rounded-plate px-2.5 pt-2 pb-2.5 ${species.isWarning ? "bg-warning text-warning-ink" : "bg-plate text-plate-ink"}`}
        >
          <p className="text-balance font-display text-sign font-bold">
            {species.name}
          </p>
          <ul className="mt-1.5 flex gap-1">
            {badges.map((badge) => (
              <li
                key={badge.key}
                title={badge.label}
                className="flex size-7 items-center justify-center rounded-full bg-surface text-accent"
              >
                {badge.glyph}
                <span className="sr-only">{badge.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </li>
  );
}
