import Image from "next/image";
import { useTranslations } from "next-intl";
import { optionLabel } from "@/domain/labels";
import { difficultyOptions, useOptions } from "@/domain/options";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Photo, Species } from "@/payload-types";
import { Tag } from "./ui";

export function SpeciesListItem({
  species,
  thumbnail,
  locale,
}: {
  species: Species;
  thumbnail?: Photo;
  locale: AppLocale;
}) {
  const t = useTranslations("SpeciesList");
  const src =
    thumbnail?.sizes?.thumbnail?.url ?? thumbnail?.url ?? thumbnail?.remoteUrl;

  return (
    <li className="flex gap-4 py-4">
      <div className="size-20 shrink-0 overflow-hidden rounded-panel bg-surface-muted">
        {src ? (
          <Image
            src={src}
            alt=""
            width={160}
            height={160}
            unoptimized={!thumbnail?.url}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="space-y-1">
        <Link
          href={{ pathname: "/arter/[slug]", params: { slug: species.slug } }}
          className="font-display text-lg font-semibold underline-offset-4 hover:underline"
        >
          {species.name}
        </Link>
        <p className="text-sm italic text-ink-muted">{species.latinName}</p>
        <div className="flex flex-wrap gap-1">
          {species.isWarning ? <Tag>{t("warning")}</Tag> : null}
          {species.greenCarving ? (
            <Tag>
              {optionLabel(difficultyOptions, species.greenCarving, locale)}
            </Tag>
          ) : null}
          {(species.goodForTags ?? []).map((use) => (
            <Tag key={use}>{optionLabel(useOptions, use, locale)}</Tag>
          ))}
        </div>
      </div>
    </li>
  );
}
