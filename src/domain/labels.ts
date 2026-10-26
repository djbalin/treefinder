type LabelledOption = { value: string; label: { da: string; en: string } };

/** The label of an option value in the given locale, or the raw value. */
export function optionLabel(
  options: readonly LabelledOption[],
  value: string | null | undefined,
  locale: "da" | "en",
): string {
  if (!value) return "";
  return (
    options.find((option) => option.value === value)?.label[locale] ?? value
  );
}
