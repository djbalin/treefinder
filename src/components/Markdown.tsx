import ReactMarkdown from "react-markdown";

/**
 * Card and page text (Markdown) with prose spacing; renders nothing when
 * empty. Raw HTML in the text is never rendered.
 */
export function Markdown({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) return null;

  return (
    <div className="space-y-3 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
