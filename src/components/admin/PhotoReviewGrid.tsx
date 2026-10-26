"use client";

import { Button, toast } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useState } from "react";
import {
  PHOTO_SLOTS,
  type PhotoSlot,
  photoSlotOptions,
} from "@/domain/options";

export type ReviewPhoto = {
  id: number;
  src: string;
  attribution: string;
  license: string;
  sourceUrl?: string;
  slotHint?: PhotoSlot;
};

/**
 * Candidate photos in a grid. Click a slot or reject; with the keyboard, focus
 * a photo and press 1 to 5 for a slot or X to reject (product spec §7.5).
 */
export function PhotoReviewGrid({ photos }: { photos: ReviewPhoto[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<number | null>(null);

  async function act(
    photoId: number,
    action: "select" | "reject",
    slot?: PhotoSlot,
  ) {
    setPending(photoId);
    try {
      const response = await fetch(`/api/photos/${photoId}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: action === "select" ? JSON.stringify({ slot }) : undefined,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? response.statusText);
      toast.success(action === "select" ? "Foto valgt." : "Foto afvist.");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPending(null);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, photoId: number) {
    const index = Number(event.key) - 1;
    const slot = PHOTO_SLOTS[index];
    if (slot) {
      event.preventDefault();
      void act(photoId, "select", slot);
    } else if (event.key.toLowerCase() === "x") {
      event.preventDefault();
      void act(photoId, "reject");
    }
  }

  return (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "1rem",
        listStyle: "none",
        padding: 0,
      }}
    >
      {photos.map((photo) => (
        <li key={photo.id}>
          <article
            // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so the keyboard shortcuts apply to this photo
            tabIndex={0}
            aria-label={`Foto ${photo.id}: ${photo.attribution}`}
            aria-busy={pending === photo.id}
            onKeyDown={(event) => onKeyDown(event, photo.id)}
            style={{
              border: "1px solid var(--theme-elevation-150)",
              borderRadius: 6,
              padding: "0.5rem",
            }}
          >
            {photo.src ? (
              // biome-ignore lint/performance/noImgElement: remote candidates are shown as-is in the admin
              <img
                src={photo.src}
                alt={photo.attribution}
                loading="lazy"
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : null}
            <p style={{ fontSize: "0.75rem", margin: "0.25rem 0" }}>
              {photo.attribution} ({photo.license}){" "}
              {photo.sourceUrl ? (
                <a
                  href={photo.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  kilde
                </a>
              ) : null}
            </p>
            {photo.slotHint ? (
              <p style={{ fontSize: "0.75rem", margin: 0 }}>
                Forslag: {photo.slotHint}
              </p>
            ) : null}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.25rem",
                marginTop: "0.5rem",
              }}
            >
              {photoSlotOptions.map((option, index) => (
                <Button
                  key={option.value}
                  buttonStyle="secondary"
                  size="small"
                  disabled={pending === photo.id}
                  onClick={() => act(photo.id, "select", option.value)}
                >
                  {index + 1} {option.label.da}
                </Button>
              ))}
              <Button
                buttonStyle="error"
                size="small"
                disabled={pending === photo.id}
                onClick={() => act(photo.id, "reject")}
              >
                X Afvis
              </Button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
