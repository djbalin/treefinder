import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { REQUIRED_PHOTO_SLOTS } from "@/domain/options";
import type { Photo, Species } from "@/payload-types";
import { FetchPhotosButton } from "./FetchPhotosButton";
import { PhotoReviewGrid } from "./PhotoReviewGrid";

/**
 * The review queue (product spec §7.5): photo candidates grouped by species.
 * Cards waiting for review are added in milestone 6.
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
                  <td style={cell}>{item.status}</td>
                  <td style={cell}>
                    {filled.length} / {REQUIRED_PHOTO_SLOTS.length}
                  </td>
                  <td style={cell}>{group?.candidates.length ?? 0}</td>
                  <td style={cell}>
                    <FetchPhotosButton speciesId={item.id} />
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
