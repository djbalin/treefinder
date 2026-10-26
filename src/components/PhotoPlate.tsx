import Image from "next/image";
import { useTranslations } from "next-intl";
import type { PhotoSlot } from "@/domain/options";
import { isOptimizable, type PublicPhoto } from "@/lib/content";
import { PlateNumber } from "./ui";

export type PlateEntry = {
  number: number;
  slot: PhotoSlot;
  label: string;
  photo?: PublicPhoto;
};

/**
 * The card's reference photos as one numbered field-guide plate. Numbers key
 * the photos to the identification text, and the caption carries every
 * credit line (constitution, product rule 4).
 */
export function PhotoPlate({ entries }: { entries: PlateEntry[] }) {
  const t = useTranslations("Card");

  return (
    <figure className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 border border-line p-1.5">
        {entries.map((entry) => (
          <PlateTile key={entry.number} entry={entry} />
        ))}
      </div>
      <figcaption>
        <ol className="space-y-1 font-label text-sm text-ink-muted">
          {entries.map(({ number, label, photo }) => (
            <li key={number} className="flex gap-2">
              <span className="w-4 shrink-0 font-bold text-accent">
                {number}
              </span>
              <span>
                <span className="font-semibold text-ink">{label}.</span>{" "}
                {photo ? <Credit photo={photo} /> : t("noPhoto")}
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

function PlateTile({ entry }: { entry: PlateEntry }) {
  const t = useTranslations("Card");
  const { number, label, photo } = entry;
  const src = photo?.url;

  return (
    <div className="relative aspect-4/5 bg-surface-muted">
      {photo && src ? (
        <a href={src} className="relative block size-full">
          <Image
            src={src}
            alt={photo.alt ?? label}
            fill
            sizes="(min-width: 1024px) 13rem, 50vw"
            loading={number <= 2 ? "eager" : "lazy"}
            unoptimized={!isOptimizable(src)}
            className="object-cover"
          />
        </a>
      ) : (
        <p className="flex size-full items-center justify-center p-2 text-center font-label text-sm text-ink-muted">
          {t("noPhoto")}
        </p>
      )}
      <PlateNumber className="absolute left-1.5 top-1.5">{number}</PlateNumber>
    </div>
  );
}

function Credit({ photo }: { photo: PublicPhoto }) {
  const t = useTranslations("Card");

  return (
    <>
      {t("photoCredit", { attribution: photo.attribution })}
      {photo.sourceUrl ? (
        <>
          {" "}
          (
          <a
            className="whitespace-nowrap underline hover:text-ink"
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
    </>
  );
}
