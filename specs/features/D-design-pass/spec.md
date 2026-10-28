# D. Design pass: spec

Status: agreed (in progress, page by page)
Milestone: see `specs/roadmap.md`

## Problem

The public site started with neutral placeholder styling. Carvers arriving from a link in a Facebook group should meet a site that looks like it belongs to the carving world, shows the trees before it explains them, and makes safety information impossible to miss. The visual direction is set with the impeccable design skill, one page at a time, and `DESIGN.md` records the result.

The first pass (October 2026) gave the species card a calm "field guide plate" look. The maintainer found it too formal and text-heavy, so the second pass replaced the whole visual world, starting on the home page. `PRODUCT.md` was updated to match: colourful and brave, glyphs carry the carving factors, fewer words.

## Requirements

1. The visual world is "flat enamel": solid, untinted colour on a white ground. An ink header bar, cobalt for links, actions and the picked filter, forest green for name bands and the food-safety check, signal red only for toxic species. No yellow. Gabarito for names, navigation and labels, Figtree for text. Square-cut tiles, authored glyphs in one stroke weight, no keylines, gradients or shadows. All values live in `src/styles/tokens.css`.
2. The header is one slim ink bar with the page links and the search, on every page. There is no logo.
3. The home page is a wall of published trees: each tile is a swipeable carousel of the tree's whole tree, bark and leaf photos, switched by three glyph buttons in the top right, with a full-width name band and three badges in a fixed order: carvability (one to three knife cuts), dry hardness (rising bars) and food safety (checked, not checked, or toxic). Toxic trees get a red band with the word "Giftig".
4. A one-line legend above the wall names the three badges. A single horizontal row of use pills ("Hvad vil du lave?") filters the wall through `?brug=`.
5. Every photo on the home page is credited with author, license and source.
6. The species card keeps its numbered plate, ruled key and numbered identification text from the first pass, now in the new tokens, until its own pass in the new world.
7. Other pages keep their current structure inside the new world until their own pass.
8. `DESIGN.md` and `.impeccable/design.json` describe the current world.

## Acceptance criteria

- [ ] The end-to-end tests pass: the home heading, search from the home page, the card tests, no horizontal scrolling at 360 px.
- [x] Text, icons and controls meet WCAG 2.2 AA contrast; the design detector reports no findings on the changed files.
- [x] Badges have screen-reader labels; toxicity is shown in words, not only colour.
- [x] `DESIGN.md` and `.impeccable/design.json` describe the flat enamel world.

## Out of scope

- Restyling the species card, species list, filter key and static pages in the new world (next passes).
- The Payload admin and review queue.
- Dark mode.

## Open questions

- Should the home page feature a tree (season, launch species) or stay a neutral wall?
- Commons attributions sometimes arrive as raw metadata ("No machine-readable author provided…"); the review queue should make cleaning them easy.
