import type { ReactNode } from "react";

export type KeyMark = "check" | "warning" | "broad" | "needles" | "scales";

export type KeyRow = {
  label: string;
  value: ReactNode;
  /** Position on a three-step scale (1 to 3), drawn as marks after the value. */
  scale?: number;
  /** A drawn symbol before the value. */
  mark?: KeyMark;
  tone?: "warning";
};

/**
 * The card's key: carving facts as a ruled table, ranked by weight and rule
 * rather than by size, like the symbol key of a field guide.
 */
export function CardKey({ rows }: { rows: KeyRow[] }) {
  if (rows.length === 0) return null;

  return (
    <dl className="border-b border-line font-label">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-start gap-x-3 border-t border-line py-1.5 leading-6 sm:py-2"
        >
          <dt className="text-sm text-ink-muted sm:text-base">{row.label}</dt>
          <dd
            className={`flex items-start gap-x-2 font-semibold ${row.tone === "warning" ? "text-warning" : ""}`}
          >
            {row.mark ? <Mark kind={row.mark} /> : null}
            {row.scale ? <ScaleMarks filled={row.scale} /> : null}
            <span className="min-w-0">{row.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ScaleMarks({ filled }: { filled: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 34 10"
      className="mt-2 h-2.5 w-auto shrink-0"
    >
      {[0, 1, 2].map((step) => (
        <rect
          key={step}
          x={step * 12 + 0.75}
          y={0.75}
          width={8.5}
          height={8.5}
          className={
            step < filled
              ? "fill-key stroke-key"
              : "fill-transparent stroke-key"
          }
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

/** Drawn key symbols, one stroke weight, in plate green or warning red. */
function Mark({ kind }: { kind: KeyMark }) {
  const tone = kind === "warning" ? "stroke-warning" : "stroke-accent";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`mt-1 size-4 shrink-0 fill-none ${tone}`}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {MARK_PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const MARK_PATHS: Record<KeyMark, string[]> = {
  check: ["M2.5 8.5 6.5 12.5 13.5 3.5"],
  warning: ["M8 1.75 14.75 14H1.25Z", "M8 6.25v3.5", "M8 11.9v.1"],
  broad: ["M8 14.5V7", "M8 14.5C3 12 2.5 6 8 1.5 13.5 6 13 12 8 14.5Z"],
  needles: [
    "M8 1.5v13",
    "M8 4 4 2",
    "M8 4l4-2",
    "M8 7.5 3.5 5.5",
    "M8 7.5l4.5-2",
    "M8 11 3.5 9",
    "M8 11l4.5-2",
  ],
  scales: [
    "M8 1.5v13",
    "M8 5 5.5 3",
    "M8 5l2.5-2",
    "M8 9 5 7",
    "M8 9l3-2",
    "M8 13 4.5 11",
    "M8 13l3.5-2",
  ],
};
