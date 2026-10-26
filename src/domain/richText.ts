type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

type LexicalState = {
  root?: LexicalNode;
} | null;

/** True when a Lexical rich text value holds no visible text. */
export function isRichTextEmpty(value: unknown): boolean {
  if (value == null) return true;
  const root = (value as LexicalState)?.root;
  if (!root) return true;
  return !hasText(root);
}

function hasText(node: LexicalNode): boolean {
  if (typeof node.text === "string" && node.text.trim().length > 0) return true;
  return (node.children ?? []).some(hasText);
}

/** Builds a minimal Lexical value from plain paragraphs (seed data, tests). */
export function richTextFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        textFormat: 0,
        children: [
          {
            type: "text",
            text,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      })),
    },
  };
}
