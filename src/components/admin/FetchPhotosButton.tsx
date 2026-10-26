"use client";

import { Button, toast } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FetchPhotosButton({ speciesId }: { speciesId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const response = await fetch(`/api/species/${speciesId}/fetch-photos`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      toast.success("Henter fotokandidater…");
      // The job runs after the response; refresh once it has had time to finish.
      setTimeout(() => router.refresh(), 8000);
    } catch (error) {
      toast.error(`Kunne ikke starte: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      buttonStyle="secondary"
      disabled={busy}
      onClick={start}
      size="small"
    >
      {busy ? "Starter…" : "Hent fotos"}
    </Button>
  );
}
