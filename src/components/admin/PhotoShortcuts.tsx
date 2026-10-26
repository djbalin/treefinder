"use client";

import { useEffect } from "react";

/**
 * Desktop shortcuts for the review queue (product spec §7.5): with a photo
 * focused, 1–5 picks a slot and X rejects it. They press the photo's own
 * buttons, so the forms work the same with or without JavaScript.
 */
export function PhotoShortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const photo = (event.target as HTMLElement | null)?.closest(
        "[data-photo]",
      );
      if (!photo) return;
      const key = event.key.toLowerCase();
      const button = photo.querySelector<HTMLButtonElement>(
        `[data-shortcut="${key}"]`,
      );
      if (!button) return;
      event.preventDefault();
      button.click();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
