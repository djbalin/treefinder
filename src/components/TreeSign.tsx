import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { optionLabel } from "@/domain/labels";
import { difficultyOptions, hardnessOptions } from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Photo, Species } from "@/payload-types";
import { DifficultyGlyph, Glyph, HardnessGlyph } from "./Glyph";

/**
 * One tree on the home page wall: its photo with an enamel name plate and
 * a fixed row of round badges (carvability, dry hardness, food safety),
 * always in that order so trees compare at a glance.
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

  // Fixed cells: every tree has all three, an empty cell when a value is missing.
  const badges: { key: string; label?: string | null; glyph?: ReactNode }[] = [
    {
      key: "carving",
      label:
        species.greenCarving &&
        `${t("greenCarving")}: ${optionLabel(difficultyOptions, species.greenCarving, locale)}`,
      glyph: species.greenCarving && (
        <DifficultyGlyph value={species.greenCarving} className="size-5" />
      ),
    },
    {
      key: "hardness",
      label:
        species.dryHardness &&
        `${t("dryHardness")}: ${optionLabel(hardnessOptions, species.dryHardness, locale)}`,
      glyph: species.dryHardness && (
        <HardnessGlyph value={species.dryHardness} className="size-5" />
      ),
    },
    species.isWarning
      ? {
          key: "food",
          label: t("toxic"),
          glyph: <Glyph name="warning" className="size-5 text-warning" />,
        }
      : species.foodSafetyChecked
        ? {
            key: "food",
            label: tHome("foodSafe"),
            glyph: <Glyph name="check" className="size-5 text-plate" />,
          }
        : {
            key: "food",
            label: tHome("foodUnchecked"),
            glyph: <Glyph name="unknown" className="size-5 text-ink-muted" />,
          },
  ];

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
          className={`absolute inset-x-0 bottom-0 px-3 pt-2 pb-3 ${species.isWarning ? "bg-warning text-warning-ink" : "bg-plate text-plate-ink"}`}
        >
          <p className="text-balance font-display text-sign font-extrabold">
            {species.name}
          </p>
          {species.isWarning ? (
            <p className="font-display text-sm font-bold uppercase tracking-wide">
              {tHome("toxic")}
            </p>
          ) : null}
          <ul className="mt-2 flex gap-1.5">
            {badges.map((badge) => (
              <li
                key={badge.key}
                title={badge.label || undefined}
                className="flex size-7 items-center justify-center rounded-full bg-surface text-accent"
              >
                {badge.glyph}
                {badge.label ? (
                  <span className="sr-only">{badge.label}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </li>
  );
}
