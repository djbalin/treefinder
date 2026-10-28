import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { optionLabel } from "@/domain/labels";
import type { PhotoSlot } from "@/domain/options";
import { difficultyOptions, hardnessOptions } from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  isOptimizable,
  type PublicPhoto,
  type SpeciesListItem,
} from "@/lib/content";
import { DifficultyGlyph, Glyph, HardnessGlyph } from "./Glyph";
import {
  type CarouselSlide,
  type CarouselView,
  TreeCarousel,
} from "./TreeCarousel";

/** The views the home page carousel shows, in order. */
const VIEWS: CarouselView[] = ["wholeTree", "bark", "leaf"];

/**
 * One tree on the home page wall: a carousel of its whole tree, bark and
 * leaf photos, with an enamel name plate and a fixed row of round badges
 * (carvability, dry hardness, food safety), always in that order so trees
 * compare at a glance.
 */
export function TreeSign({
  species,
  photos,
  locale,
}: {
  species: SpeciesListItem;
  photos: Partial<Record<PhotoSlot, PublicPhoto>>;
  locale: AppLocale;
}) {
  const t = useTranslations("Card");
  const tHome = useTranslations("Home");
  const available: CarouselSlide[] = VIEWS.flatMap((view) => {
    const photo = photos[view];
    return photo
      ? [
          {
            view,
            url: photo.url,
            optimizable: isOptimizable(photo.url),
            label: tHome(`views.${view}`),
          },
        ]
      : [];
  });
  // Each page load starts every tree on a random view: the strip is rotated
  // so that view comes first, which avoids a jump after hydration.
  const start = Math.floor(Math.random() * available.length);
  const slides = [...available.slice(start), ...available.slice(0, start)];

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
    <li className="relative aspect-3/4 overflow-hidden rounded-panel bg-surface-muted">
      {slides.length > 0 ? (
        <TreeCarousel slides={slides} slug={species.slug} />
      ) : (
        <p className="p-4 font-display text-sm text-ink-muted">
          {tHome("noPhoto")}
        </p>
      )}
      <Link
        href={{ pathname: "/arter/[slug]", params: { slug: species.slug } }}
        className="absolute inset-x-0 bottom-0 block"
      >
        <div
          className={`px-3 pt-2 pb-3 ${species.isWarning ? "bg-warning text-warning-ink" : "bg-plate text-plate-ink"}`}
        >
          <p className="text-balance font-display xs:text-sign text-small font-medium xs:font-extrabold">
            {species.name} {species.isWarning && "(giftig)"}
          </p>
          {/* {species.isWarning ? (
            <p className="font-display text-sm font-bold uppercase tracking-wide">
              {tHome("toxic")}aaa
            </p>
          ) : null} */}
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
