---
version: 1
slug: "src-app-frontend-locale-arter-slug-page-tsx"
primary_target: "src/app/(frontend)/[locale]/arter/[slug]/page.tsx"
related_targets: []
---

# Species card (/arter/[slug])

Mode: Read. A carver reads one species' carving card at home, mostly on a phone, and recognises the tree from its reference photos. Sets the visual world for the whole public site; list, filter key, home and static pages inherit it.

## Direction contract

THESIS: The card is a field-guide spread: a numbered plate of the tree beside keyed text. It refuses the species-app default of a swipe carousel, chips and rounded cards.

OWN-WORLD: White handbook page, near-black ink, one plate green for plate numbers, key symbols and links, ochre only for the key's scale marks, warning red only for toxic species. Source Serif 4 for title and reading text, Archivo for the header, keys and captions. Hairline ink rules, square corners, no shadows.

STORY: The reader sees what tree this is, how it carves, and whether it's safe, then reads on, and every claim can be traced to a source.

FIRST VIEWPORT: Thin ruled header; serif name and italic Latin, no label above them; a 2x2 numbered plate (tree, leaf, bark, twig) with a numbered caption; a symbol key of carving facts and leaf type; then the reading column. On desktop the plate holds the left page, sticky, beside the text. Phone adaptation (PRODUCT.md principle 1, carving knowledge first): the key comes before the plate, so the plate starts just inside the first 390px viewport and its caption sits below it.

FORM: Nordic flora handbook plate, candidate 1 of 7 (Impeccable's pick, chosen over the roll). seed:85cdb782d2081fe3

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- No botanical family field exists. Adding one is a later content decision.
- "Forveksles med" stays a linked list until look-alike thumbnails are queried.
