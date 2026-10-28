import type { Difficulty, Hardness, Use } from "@/domain/options";

/*
 * The site's glyph set: authored line icons on a 24px grid, one stroke
 * weight, round caps. Glyphs are decorative; the text next to them (or a
 * screen-reader label) always carries the meaning.
 */

export type GlyphName =
  | Use
  | "check"
  | "warning"
  | "unknown"
  | "broad"
  | "needles"
  | "scales"
  | "arrow"
  | "tree"
  | "bark";

const PATHS: Record<GlyphName, string[]> = {
  spoons: [
    "M12 2.5c2.5 0 4.25 2.4 4.25 5.15S14.5 12.5 12 12.5 7.75 10.4 7.75 7.65 9.5 2.5 12 2.5Z",
    "M12 12.5v9",
  ],
  bowls: ["M3.25 10.5h17.5a8.75 6.5 0 0 1-17.5 0Z", "M9 20.25h6"],
  kuksa: [
    "M3.75 8.5h11v3.75a5.5 5.5 0 0 1-11 0Z",
    "M14.75 9.5h2.5a2.5 2.5 0 0 1 0 5h-3",
  ],
  figures: [
    "M12 3a2.6 2.6 0 1 0 0 5.2A2.6 2.6 0 1 0 12 3Z",
    "M8.75 21l1.1-9.25h4.3L15.25 21Z",
  ],
  handles: [
    "M4.4 21.6 2.4 19.6a1.4 1.4 0 0 1 0-2L8.9 11.1l4 4-6.5 6.5a1.4 1.4 0 0 1-2 0Z",
    "M12.9 15.1 8.9 11.1 18.6 3.6c.9-.7 2.5.9 1.8 1.8Z",
  ],
  spatulas: ["M9 2.75h6v7.5a3 3 0 0 1-6 0Z", "M12 13.25v8"],
  boxes: ["M4.5 9.5h15v10.75h-15Z", "M3.25 5.75h17.5v3.75H3.25Z", "M10 13h4"],
  check: ["M4.5 12.5 9.5 17.5 19.5 6.5"],
  warning: ["M12 3 21.5 20H2.5Z", "M12 9.5v4.75", "M12 17.1v.15"],
  unknown: [
    "M9.25 9a2.9 2.9 0 1 1 3.9 2.75c-.75.3-1.15.9-1.15 1.65v.6",
    "M12 17.6v.15",
  ],
  broad: [
    "M12 21.25V11",
    "M12 21.25C5 17.5 4.5 9 12 2.75 19.5 9 19 17.5 12 21.25Z",
  ],
  needles: [
    "M12 2.75v18.5",
    "M12 6.5 6.5 3.75",
    "M12 6.5l5.5-2.75",
    "M12 11.5 5.75 8.5",
    "M12 11.5l6.25-3",
    "M12 16.5 5.75 13.5",
    "M12 16.5l6.25-3",
  ],
  scales: [
    "M12 2.75v18.5",
    "M12 7.5 8.5 4.75",
    "M12 7.5l3.5-2.75",
    "M12 13 8 10",
    "M12 13l4-3",
    "M12 18.5 7.25 15.5",
    "M12 18.5l4.75-3",
  ],
  arrow: ["M4 12h15", "M13.5 6.5 19 12l-5.5 5.5"],
  tree: [
    "M6.6 13.75a3.6 3.6 0 0 1 .35-6.75 5.1 5.1 0 0 1 10.1 0 3.6 3.6 0 0 1 .35 6.75Z",
    "M12 13.75v7",
    "M12 16.25 9.75 14.5",
    "M8.75 20.75h6.5",
  ],
  bark: [
    "M7 3.25c1.4 2.75-1.4 5.5 0 8.75s-1.4 6 0 8.75",
    "M12 3.25c-1.4 2.75 1.4 5.5 0 8.75s1.4 6 0 8.75",
    "M17 3.25c1.4 2.75-1.4 5.5 0 8.75s-1.4 6 0 8.75",
  ],
};

export function Glyph({
  name,
  className = "",
}: {
  name: GlyphName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`fill-none stroke-current ${className}`}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const LEVEL: Record<Difficulty | Hardness, number> = {
  easy: 1,
  soft: 1,
  medium: 2,
  hard: 3,
};

/**
 * Carvability as knife cuts: one cut is easy, three is hard. The count is
 * the value, so the levels stay apart at badge size.
 */
export function DifficultyGlyph({
  value,
  className = "",
}: {
  value: Difficulty;
  className?: string;
}) {
  const level = LEVEL[value];
  const first = 12 - (level - 1) * 3;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`fill-none stroke-current ${className}`}
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      {Array.from({ length: level }, (_, step) => {
        const x = first + step * 6;
        return <path key={x} d={`M${x - 2.5} 19 ${x + 2.5} 5`} />;
      })}
    </svg>
  );
}

/**
 * Dry hardness as three rising bars; the harder the wood, the more bars
 * are filled.
 */
export function HardnessGlyph({
  value,
  className = "",
}: {
  value: Hardness;
  className?: string;
}) {
  const level = LEVEL[value];
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {[0, 1, 2].map((step) => (
        <rect
          key={step}
          x={3.5 + step * 6.25}
          y={14 - step * 4.5}
          width={4.25}
          height={6.5 + step * 4.5}
          rx={1}
          className={
            step < level
              ? "fill-current stroke-current"
              : "fill-none stroke-current"
          }
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
