import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { optionLabel } from "@/domain/labels";
import { cardStatusOptions, REQUIRED_PHOTO_SLOTS } from "@/domain/options";
import type { Photo, Species } from "@/payload-types";
import { PhotoReviewGrid } from "./PhotoReviewGrid";
import { QueueButton } from "./QueueButton";

/**
 * The review queue (product spec §7.5): cards waiting for review, oldest
 * first, then photo candidates grouped by species, then every species with
 * its photo coverage and actions.
 */
export async function ReviewQueue({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login");
  const { payload } = req;

  const [species, photos] = await Promise.all([
    payload.find({
      collection: "species",
      depth: 0,
      pagination: false,
      sort: "name",
      locale: "da",
      req,
    }),
    payload.find({
      collection: "photos",
      where: { status: { in: ["candidate", "selected"] } },
      depth: 0,
      pagination: false,
      sort: "createdAt",
      req,
    }),
  ]);

  const byspecies = groupPhotos(photos.docs);
  // AI drafts wait for a read-through; approved cards wait to be published.
  const cardsWaiting = species.docs
    .filter((item) => item.status === "aiDraft" && hasDraftContent(item))
    .concat(species.docs.filter((item) => item.status === "approved"))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const withCandidates = species.docs.filter(
    (item) => (byspecies.get(item.id)?.candidates.length ?? 0) > 0,
  );

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1>Gennemgang</h1>
        <p>
          Vælg en plads for hvert foto, eller afvis det. Med tastaturet: fokuser
          et foto og tryk 1 til 5 for en plads (1 hele træet, 2 blad, 3 bark, 4
          vinterkvist, 5 skåret ved) eller X for at afvise.
        </p>

        <h2>Kort til gennemgang</h2>
        {cardsWaiting.length === 0 ? (
          <p>Ingen kort venter.</p>
        ) : (
          <ul>
            {cardsWaiting.map((item) => (
              <li key={item.id}>
                <a href={`/admin/collections/species/${item.id}`}>
                  {item.name}
                </a>{" "}
                ({optionLabel(cardStatusOptions, item.status, "da")}, opdateret{" "}
                {new Date(item.updatedAt).toLocaleDateString("da-DK")})
              </li>
            ))}
          </ul>
        )}

        <h2>Fotokandidater</h2>
        {withCandidates.length === 0 ? (
          <p>Ingen kandidater venter. Hent kandidater for en art nedenfor.</p>
        ) : (
          withCandidates.map((item) => (
            <section key={item.id} style={{ marginBottom: "2rem" }}>
              <h3>
                <a href={`/admin/collections/species/${item.id}`}>
                  {item.name}
                </a>{" "}
                <em>({item.latinName})</em>
              </h3>
              <SlotCoverage selected={byspecies.get(item.id)?.selected ?? []} />
              <PhotoReviewGrid
                photos={(byspecies.get(item.id)?.candidates ?? []).map(
                  toReviewPhoto,
                )}
              />
            </section>
          ))
        )}

        <h2>Arter</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={cell}>Art</th>
              <th style={cell}>Status</th>
              <th style={cell}>Valgte fotos</th>
              <th style={cell}>Kandidater</th>
              <th style={cell} />
            </tr>
          </thead>
          <tbody>
            {species.docs.map((item: Species) => {
              const group = byspecies.get(item.id);
              const filled = REQUIRED_PHOTO_SLOTS.filter((slot) =>
                group?.selected.some((p) => p.slot === slot),
              );
              return (
                <tr key={item.id}>
                  <td style={cell}>
                    <a href={`/admin/collections/species/${item.id}`}>
                      {item.name}
                    </a>
                  </td>
                  <td style={cell}>
                    {optionLabel(cardStatusOptions, item.status, "da")}
                  </td>
                  <td style={cell}>
                    {filled.length} / {REQUIRED_PHOTO_SLOTS.length}
                  </td>
                  <td style={cell}>{group?.candidates.length ?? 0}</td>
                  <td style={{ ...cell, display: "flex", gap: "0.5rem" }}>
                    <QueueButton speciesId={item.id} action="fetch-photos" />
                    {item.status === "aiDraft" ||
                    item.status === "needsChanges" ? (
                      <QueueButton speciesId={item.id} action="draft-card" />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Gutter>
    </DefaultTemplate>
  );
}

const cell = {
  textAlign: "left" as const,
  padding: "0.4rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
};

function groupPhotos(photos: Photo[]) {
  const groups = new Map<number, { candidates: Photo[]; selected: Photo[] }>();
  for (const photo of photos) {
    const speciesId =
      typeof photo.species === "object" ? photo.species.id : photo.species;
    const group = groups.get(speciesId) ?? { candidates: [], selected: [] };
    (photo.status === "selected" ? group.selected : group.candidates).push(
      photo,
    );
    groups.set(speciesId, group);
  }
  return groups;
}

function toReviewPhoto(photo: Photo) {
  return {
    id: photo.id,
    src: photo.sizes?.thumbnail?.url ?? photo.url ?? photo.remoteUrl ?? "",
    attribution: photo.attribution,
    license: photo.license,
    sourceUrl: photo.sourceUrl ?? undefined,
    slotHint: photo.slot ?? undefined,
  };
}

function SlotCoverage({ selected }: { selected: Photo[] }) {
  const filled = new Set(selected.map((photo) => photo.slot));
  return (
    <p style={{ fontSize: "0.85rem" }}>
      Valgt:{" "}
      {REQUIRED_PHOTO_SLOTS.map(
        (slot) => `${filled.has(slot) ? "✓" : "–"} ${slot}`,
      ).join(" · ")}
      {filled.has("cutWood") ? " · ✓ cutWood" : ""}
    </p>
  );
}

/** An AI draft counts as waiting only once the drafting job has written something. */
function hasDraftContent(species: Species) {
  return Boolean(
    species.greenCarving || species.foodSafety || species.sources?.length,
  );
}
