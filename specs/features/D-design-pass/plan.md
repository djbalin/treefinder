# D. Design pass: plan

## Approach

Ran the impeccable new-work flow for a Read surface: one rolled direction, Impeccable's own pick and the category standard were put on a decision page, and the maintainer chose the field guide plate. The direction contract lives in `.impeccable/surfaces/`. Built code-led (no image generation), verified with screenshots at 390 and 1440 px against a local Postgres with two sample cards, then reviewed by the impeccable finish reviewer.

Rejected: a "wood library" (xylothek) world, which was the rolled direction, and the species-app standard (carousel, chips, rounded cards).

## Second pass: home page and a new world

The maintainer asked for something more colourful, brave and less text-heavy, starting on the home page. A first direction round (riso festival line-up) was re-rolled with the steer "a bit less bold, tree photos clearly on the home page"; the second round's "Scandinavian enamel signs" was chosen. After the build and two review rounds the maintainer asked for it bolder and less kitsch: yellow, keylines, the logo, the hero card and the arrow signposts were removed, the use filter went back to one horizontal row, and the leaf-type badge was dropped. The direction contract lives in `.impeccable/surfaces/src-app-frontend-locale-page-tsx.md`.

| Area   | Files or modules                                   | Change                                                            |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------- |
| Tokens | `src/styles/tokens.css`, `src/styles/globals.css`  | Flat enamel palette, Gabarito and Figtree, smaller radii          |
| Header | `SiteHeader`, `SearchForm`                         | Slim ink bar with links and search; unique search input ids       |
| Home   | `src/app/(frontend)/[locale]/page.tsx`, `TreeSign` | Photo wall with name bands and badges, use pills, legend, credits |
| Glyphs | `src/components/Glyph.tsx`                         | Authored glyph set for uses, food safety and carving factors      |

## Changes

| Area   | Files or modules                                                     | Change                                                                |
| ------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Tokens | `src/styles/tokens.css`, `src/styles/globals.css`                    | New palette, type, layout tokens; selection, focus, caret             |
| Fonts  | `src/app/(frontend)/[locale]/layout.tsx`                             | Source Serif 4 and Archivo via `next/font`, wider page container      |
| Card   | `src/app/(frontend)/[locale]/arter/[slug]/page.tsx`                  | Plate, key, numbered identification, grid layout                      |
| UI     | `PhotoPlate`, `CardKey`, `ui.tsx`, `SiteHeader`, `SourcesDisclosure` | New and restyled shared components; `PhotoFigure` and `Badge` removed |
| Pages  | other frontend pages                                                 | Capped at reading width                                               |

## Tests

Second pass: `tests/e2e/foundation.e2e.ts` checks the new home heading; the search test now uses the header search.


| Acceptance criterion           | Test                                           |
| ------------------------------ | ---------------------------------------------- |
| Card behaviour unchanged       | `tests/e2e/publicSite.e2e.ts`                  |
| No horizontal scroll at 360 px | `tests/e2e/publicSite.e2e.ts` (mobile project) |
| Contrast and detector findings | `impeccable detect`, finish review             |
| DESIGN.md matches tokens       | impeccable documenter                          |

## Risks and spec updates

- Product spec §5 listed carving green and hardness as "badges". They are now rows in a ruled key, and §5 is updated to match.
