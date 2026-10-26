import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Photo } from "@/payload-types";

/** One reference photo with its credit line (constitution, product rule 4). */
export function PhotoFigure({
  photo,
  caption,
}: {
  photo?: Photo;
  caption: string;
}) {
  const t = useTranslations("Card");
  const src = photo?.sizes?.card?.url ?? photo?.url ?? photo?.remoteUrl;

  return (
    <figure className="space-y-1">
      <figcaption className="text-sm font-medium">{caption}</figcaption>
      {photo && src ? (
        <>
          <Image
            src={src}
            alt={photo.alt ?? caption}
            width={photo.width ?? 1200}
            height={photo.height ?? 900}
            // Candidates link to external files until they are stored.
            unoptimized={!photo.url}
            className="aspect-4/3 w-full rounded-panel bg-surface-muted object-cover"
          />
          <p className="text-xs text-ink-muted">
            {t("photoCredit", { attribution: photo.attribution })}
            {photo.sourceUrl ? (
              <>
                {" "}
                (
                <a
                  className="underline"
                  href={photo.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {photo.license}
                </a>
                )
              </>
            ) : (
              ` (${photo.license})`
            )}
          </p>
        </>
      ) : (
        <div className="flex aspect-4/3 w-full items-center justify-center rounded-panel bg-surface-muted text-sm text-ink-muted">
          {t("noPhoto")}
        </div>
      )}
    </figure>
  );
}
