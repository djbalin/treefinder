export type Locale = "da" | "en";
export type Localized = { da: string; en?: string };

/**
 * The text in the requested locale, falling back to Danish (the required
 * locale). Empty or whitespace-only text counts as missing.
 */
export function pick(
  text: Localized | undefined,
  locale: Locale,
): string | null {
  if (!text) return null;
  const value = locale === "en" && text.en?.trim() ? text.en : text.da;
  return value.trim() ? value : null;
}
