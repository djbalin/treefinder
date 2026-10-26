const DANISH_LETTERS: Record<string, string> = {
  æ: "ae",
  ø: "oe",
  å: "aa",
};

/** URL slug from a Danish name: "Småbladet lind" -> "smaabladet-lind". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[æøå]/g, (letter) => DANISH_LETTERS[letter] ?? letter)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
