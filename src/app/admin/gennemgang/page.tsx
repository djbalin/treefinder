import { api } from "@convex/_generated/api";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Notice } from "@/components/admin/forms";
import { PhotoCard } from "@/components/admin/PhotoCard";
import { PhotoShortcuts } from "@/components/admin/PhotoShortcuts";
import { PageTitle } from "@/components/ui";
import { optionLabel } from "@/domain/labels";
import { cardStatusOptions } from "@/domain/options";
import { adminQuery } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";

const RETURN_TO = "/admin/gennemgang";

type Props = { searchParams: Promise<{ gemt?: string; fejl?: string }> };

/** The review queue: drafted cards and photo candidates (product spec §7.5). */
export default async function ReviewPage({ searchParams }: Props) {
  const t = await getTranslations("Admin");
  const { gemt, fejl } = await searchParams;
  const queue = await adminQuery(api.admin.photos.reviewQueue, {});

  return (
    <div className="space-y-8">
      <PageTitle>{t("reviewHeading")}</PageTitle>
      <Notice saved={gemt === "1"} error={fejl} savedText={t("saved")} />

      <section aria-labelledby="review-cards" className="space-y-3">
        <h2 id="review-cards" className="font-display text-xl font-bold">
          {t("cardsHeading")}
        </h2>
        {queue.cards.length === 0 ? (
          <p className="text-ink-muted">{t("noCards")}</p>
        ) : (
          <ul className="space-y-1">
            {queue.cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/admin/arter/${card.id}`}
                  className="font-display font-bold text-accent hover:underline"
                >
                  {card.name}
                </Link>{" "}
                <span className="text-sm text-ink-muted">
                  {optionLabel(cardStatusOptions, card.status, "da")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="review-photos" className="space-y-4">
        <h2 id="review-photos" className="font-display text-xl font-bold">
          {t("candidatesHeading")}
        </h2>
        <p className="text-sm text-ink-muted">{t("keyboardHint")}</p>
        <PhotoShortcuts />
        {queue.candidates.length === 0 ? (
          <p className="text-ink-muted">{t("noCandidates")}</p>
        ) : (
          queue.candidates.map((group) => (
            <div key={group.speciesId} className="space-y-2">
              <h3 className="font-display text-lg font-bold">
                <Link
                  href={`/admin/arter/${group.speciesId}`}
                  className="hover:underline"
                >
                  {group.speciesName}
                </Link>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    returnTo={RETURN_TO}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
