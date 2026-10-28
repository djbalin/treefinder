import Image from "next/image";
import { useTranslations } from "next-intl";
import { isOptimizable, type PublicPhoto } from "@/lib/content";

/**
 * A slot's gallery on the card: a swipeable strip of the photos the admin
 * picked besides the poster (which the plate shows), each with its credit. Tapping a photo opens it
 * full size. Plain scroll-snap, so it works without JavaScript.
 */
export function PhotoGallery({
  label,
  photos,
}: {
  label: string;
  photos: PublicPhoto[];
}) {
  const t = useTranslations("Card");
  if (photos.length === 0) return null;

  return (
    <ul
      aria-label={label}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
    >
      {photos.map((photo) => (
        <li key={photo.id} className="w-48 shrink-0 snap-start space-y-1">
          <a
            href={photo.url}
            className="relative block aspect-4/3 overflow-hidden rounded-panel bg-surface-muted"
          >
            <Image
              src={photo.url}
              alt={photo.alt ?? label}
              fill
              sizes="12rem"
              loading="lazy"
              unoptimized={!isOptimizable(photo.url)}
              className="object-cover"
            />
          </a>
          <p className="text-xs leading-snug text-ink-muted">
            {t("photoCredit", { attribution: photo.attribution })} (
            {photo.sourceUrl ? (
              <a
                href={photo.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="underline"
              >
                {photo.license}
              </a>
            ) : (
              photo.license
            )}
            )
          </p>
        </li>
      ))}
    </ul>
  );
}
