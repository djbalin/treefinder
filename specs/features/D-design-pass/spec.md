# D. Design pass: spec

Status: draft
Milestone: see `specs/roadmap.md`

## Problem

The public site still uses neutral placeholder styling. Carvers arriving from a link in a Facebook group should meet a card that reads calmly on a phone, looks like it belongs to the carving world, and makes its safety information impossible to miss. The visual direction is set with the impeccable design skill, starting on the species card, and every other page inherits it.

## Requirements

1. The visual world is the "field guide plate": a white handbook page, near-black ink, plate green for numbers and links, ochre key marks, warning red only for toxic species, Source Serif 4 for reading and Archivo for labels. All values live in `src/styles/tokens.css`.
2. The species card shows its reference photos as one numbered plate (whole tree, leaf, bark, winter twig, and cut wood when present), with every credit line in the plate caption.
3. Carving facts sit in a ruled key under the name: green carving and dry hardness with a three-step mark, leaf type, and the food safety check date.
4. The identification text is numbered to match the plate.
5. On a phone the order is name, key, plate, then the text. On desktop the plate sits sticky on the left, beside the name, key and text.
6. The warning banner stays above everything else on warning species (product spec §5).
7. Other pages keep their current structure inside the new world until their own pass.
8. `DESIGN.md` is generated from the built result.

## Acceptance criteria

- [x] The existing card end-to-end tests still pass: fields, Janka value, disclaimer, photo credits, look-alike link, collapsed sources, warning banner above the heading.
- [x] No horizontal scrolling at 360 px (existing end-to-end check).
- [x] Text meets WCAG 2.2 AA contrast; the design detector reports no findings on the changed files.
- [x] `DESIGN.md` and `.impeccable/design.json` exist and match `tokens.css`.

## Out of scope

- Restyling the species list, filter key, home and static pages beyond inheriting tokens and the header.
- The Payload admin and review queue.
- Look-alike thumbnails (product spec §5 calls for cards with a thumbnail; the card keeps a linked list for now).

## Open questions

- A botanical family field would let the card carry a field-guide running head. Content decision for later.
- Dark mode is not designed yet.
