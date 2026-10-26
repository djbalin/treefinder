import { defineRouting } from "next-intl/routing";

/**
 * English is hidden until its content is translated (product spec §4). With
 * the flag off, "en" is not a locale at all, so `/en` falls through to the
 * Danish catch-all route and 404s.
 */
const englishEnabled = process.env.ENABLE_ENGLISH === "true";

export const routing = defineRouting({
  locales: englishEnabled ? ["da", "en"] : ["da"],
  defaultLocale: "da",
  // Danish lives at the root, English under `/en`.
  localePrefix: "as-needed",
  // Danish visitors should not be redirected to English based on their
  // browser language while English is incomplete.
  localeDetection: false,
});

export type AppLocale = "da" | "en";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value ?? "");
}
