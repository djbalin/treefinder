"use client";

import { Button, toast } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ACTIONS = {
  "fetch-photos": {
    label: "Hent fotos",
    started: "Henter fotokandidater…",
    refreshAfterMs: 8_000,
  },
  "draft-card": {
    label: "Skriv AI-udkast",
    started: "Skriver udkast. Det tager et par minutter.",
    refreshAfterMs: 60_000,
  },
} as const;

/** Starts a background job for a species and refreshes once it has had time to run. */
export function QueueButton({
  speciesId,
  action,
}: {
  speciesId: number;
  action: keyof typeof ACTIONS;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const config = ACTIONS[action];

  async function start() {
    setBusy(true);
    try {
      const response = await fetch(`/api/species/${speciesId}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      toast.success(config.started);
      setTimeout(() => router.refresh(), config.refreshAfterMs);
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
      {busy ? "Starter…" : config.label}
    </Button>
  );
}
