"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { QueueButton } from "./QueueButton";

/** Action buttons at the top of a species in the admin. */
export function SpeciesActions() {
  const { id } = useDocumentInfo();
  if (!id) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <QueueButton speciesId={Number(id)} action="draft-card" />
      <QueueButton speciesId={Number(id)} action="fetch-photos" />
      <a href="/admin/review">Til gennemgang</a>
    </div>
  );
}
