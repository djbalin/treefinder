import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import { isRichTextEmpty } from "@/domain/richText";

/** Renders Payload rich text with prose spacing; renders nothing when empty. */
export function RichText({ value }: { value: unknown }) {
  if (isRichTextEmpty(value)) return null;

  return (
    <LexicalRichText
      className="space-y-3 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
      data={value as SerializedEditorState}
    />
  );
}
