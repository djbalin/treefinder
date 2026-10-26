# D. Design pass: plan

## Approach

Ran the impeccable new-work flow for a Read surface: one rolled direction, Impeccable's own pick and the category standard were put on a decision page, and the maintainer chose the field guide plate. The direction contract lives in `.impeccable/surfaces/`. Built code-led (no image generation), verified with screenshots at 390 and 1440 px against a local Postgres with two sample cards, then reviewed by the impeccable finish reviewer.

Rejected: a "wood library" (xylothek) world, which was the rolled direction, and the species-app standard (carousel, chips, rounded cards).

## Changes

| Area   | Files or modules                                                     | Change                                                                |
| ------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Tokens | `src/styles/tokens.css`, `src/styles/globals.css`                    | New palette, type, layout tokens; selection, focus, caret             |
| Fonts  | `src/app/(frontend)/[locale]/layout.tsx`                             | Source Serif 4 and Archivo via `next/font`, wider page container      |
| Card   | `src/app/(frontend)/[locale]/arter/[slug]/page.tsx`                  | Plate, key, numbered identification, grid layout                      |
| UI     | `PhotoPlate`, `CardKey`, `ui.tsx`, `SiteHeader`, `SourcesDisclosure` | New and restyled shared components; `PhotoFigure` and `Badge` removed |
| Pages  | other frontend pages                                                 | Capped at reading width                                               |

## Tests

| Acceptance criterion           | Test                                           |
| ------------------------------ | ---------------------------------------------- |
| Card behaviour unchanged       | `tests/e2e/publicSite.e2e.ts`                  |
| No horizontal scroll at 360 px | `tests/e2e/publicSite.e2e.ts` (mobile project) |
| Contrast and detector findings | `impeccable detect`, finish review             |
| DESIGN.md matches tokens       | impeccable documenter                          |

## Risks and spec updates

- Product spec §5 listed carving green and hardness as "badges". They are now rows in a ruled key, and §5 is updated to match.
