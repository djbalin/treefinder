"use client";

import { Button, toast, useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";

/** Action buttons at the top of a species in the admin. */
export function SpeciesActions() {
  const { id } = useDocumentInfo();
  const [busy, setBusy] = useState(false);

  if (!id) return null;

  async function fetchPhotos() {
    setBusy(true);
    try {
      const response = await fetch(`/api/species/${id}/fetch-photos`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      toast.success(
        "Henter fotokandidater. De dukker op i gennemgangen om lidt.",
      );
    } catch (error) {
      toast.error(`Kunne ikke starte: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <Button
        buttonStyle="secondary"
        disabled={busy}
        onClick={fetchPhotos}
        size="small"
      >
        {busy ? "Starter…" : "Hent fotokandidater"}
      </Button>
      <a href="/admin/review">Til gennemgang</a>
    </div>
  );
}
