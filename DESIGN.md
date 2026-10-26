---
name: Treefinder
description: Carving cards for wood carvers, set as a Nordic field-guide plate.
colors:
  surface: "#ffffff"
  surface-muted: "#f2f3ee"
  ink: "#1d1d1b"
  ink-muted: "#585a52"
  line: "#1d1d1b"
  accent: "#46602f"
  accent-ink: "#ffffff"
  key: "#a8791a"
  warning: "#a3221b"
  warning-surface: "#fbeceb"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  subtitle:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  label-small:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  panel: "0"
  control: "0.125rem"
spacing:
  plate: "6px"
  tight: "12px"
  gutter: "16px"
  block: "24px"
  section: "40px"
  spread: "48px"
components:
  site-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "12px 16px"
  site-header-link:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  site-header-link-hover:
    textColor: "{colors.ink}"
  page-title:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  section-heading:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "12px 0 0"
  card-key-row:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "8px 0"
  card-key-term:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label-small}"
  photo-plate:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.plate}"
  plate-tile-empty:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.panel}"
  plate-number:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.label-small}"
    size: "24px"
  plate-caption:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label-small}"
  warning-banner:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.panel}"
    padding: "12px 16px"
  text-link:
    textColor: "{colors.accent}"
  text-link-hover:
    textColor: "{colors.ink}"
  sources-disclosure:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "12px 0"
---

# Design System: Treefinder

## Overview

**Creative North Star: "The Flora Handbook Plate"**

Treefinder reads like a page from a Nordic flora handbook: a white page, near-black ink, a numbered plate of photographs keyed to text, and a symbol key of facts ruled off with hairlines. The species card at `/arter/[slug]` is the first and so far only surface built in this world, and it sets the system. A carver should be able to read it calmly on a phone at home, see what tree this is, how it carves, and whether it is safe, then follow any claim to its source.

The world is quiet and printed rather than app-like. Hierarchy comes from weight, rules and position, not from boxes, colour fields or shadows. Colour is spent sparingly: one plate green does the pointing (plate numbers, key symbols, links, focus), ochre fills only the carving-scale marks, and warning red appears only on toxic species. Everything else is ink on white. The design refuses the species-app default of swipe carousels, chip rows and rounded cards.

Scope: only the species card has had its own design pass. The species list, filter key, home page, "where to get wood" and about pages inherit the tokens and the site header but keep their pre-pass placeholder layouts and components. The Payload admin is unstyled by this system. Their patterns are not yet part of this document unless stated.

**Key Characteristics:**
- White handbook page, near-black ink, hairline ink rules.
- Square corners everywhere on content; no shadows, no gradients.
- Source Serif 4 for titles and reading text; Archivo for header, key, captions and other apparatus.
- A numbered photo plate whose numbers key the photos to the identification text.
- A ruled symbol key of carving facts with drawn, single-stroke marks.
- Warning red reserved for toxicity alone.

## Colors

Ink on white with one plate green, one ochre, and a red held in reserve.

### Primary
- **Plate Green** (`accent`): plate numbers, key symbols (check, leaf-type marks), text links, the disclosure marker, focus outlines, caret and text selection. It is the only colour that points at something.
- **Paper White on Green** (`accent-ink`): text on a green fill (selection; the inherited filled buttons).

### Secondary
- **Scale Ochre** (`key`): the filled and empty squares of the three-step carving scale (green carving difficulty, dry hardness). Graphic only; at 3.9:1 on white it passes for non-text marks and must never carry text.

### Tertiary
- **Warning Red** (`warning`): toxic species only. The warning banner text and rules, the warning triangle in the key, and the toxic value row.
- **Warning Wash** (`warning-surface`): the background of the warning banner and nowhere else.

### Neutral
- **Handbook White** (`surface`): the page, the plate frame, the plate-number tabs.
- **Pale Sage** (`surface-muted`): placeholder fill of an empty plate tile or thumbnail, so a missing photo still holds its place in the plate.
- **Printer's Ink** (`ink`): all reading text and titles.
- **Ink Grey** (`ink-muted`): key terms, captions, credits, Latin names, nav links at rest.
- **Hairline Ink** (`line`): every rule and frame. It is the same value as the ink on purpose: rules are printed, not tinted.

### Named Rules
**The One Pointer Rule.** Plate green marks what keys, links or has focus. It is never a fill for surfaces or decoration on the card.

**The Red Is Reserved Rule.** Warning red and its wash appear only when a species is toxic. A safe card has no red at all.

**The Ochre Never Speaks Rule.** Ochre draws the scale marks and nothing else; never use it for text.

## Typography

**Display Font:** Source Serif 4 (with Georgia, serif), loaded via next/font as `--font-serif`, normal and italic.
**Body Font:** Source Serif 4 (same family).
**Label Font:** Archivo (with ui-sans-serif, system-ui), loaded via next/font as `--font-sans`.

**Character:** A sturdy book serif carries everything meant to be read; a plain grotesque carries the apparatus of the page (header, key, captions, credits, sources), the way a field guide sets its keys apart from its prose.

### Hierarchy
- **Display** (700, 2.5rem, 1.05, -0.015em, balanced): the species name, one per page. Nothing sits above it.
- **Subtitle** (400 italic, 1.25rem): the Latin name directly under the title, in Ink Grey.
- **Headline** (600, 1.5rem, 1.25): section headings in the reading column, each under a hairline rule.
- **Body** (400, 1.0625rem, 1.6): reading text, held to the reading column (38rem).
- **Label** (Archivo 600, 1rem, 1.5): key values, identification sub-heads, the sources toggle, the header wordmark (700, 1.125rem, tight tracking).
- **Label Small** (Archivo 400, 0.875rem): key terms on phones, plate captions and credits, check dates, the food-safety disclaimer.

Tabular figures are on for all `dd` and `td`, so Janka values and dates align.

### Named Rules
**The Serif Reads, the Sans Keys Rule.** Prose and titles are serif; anything that labels, keys, credits or navigates is Archivo.

**The Weight Not Size Rule.** In the key and captions, rank is carried by weight and colour (semibold ink value against regular grey term), not by bigger type.

## Layout

The page is a single centred column up to 72rem (`--container-page`) with a 16px gutter, 24px top padding on phones and 40px from 640px up.

The species card is a named-area grid. On phones the order is warning, title, key, plate, text: carving facts come before the photographs, and the plate begins inside the first 390px viewport with its caption below it. From 1024px the card becomes a two-page spread: the plate holds the left column (26rem, `--container-plate`) and stays sticky 24px from the top, beside the title, key and reading column (up to 38rem, `--container-reading`), with a 48px gap between them. A warning banner, when present, spans both columns above everything.

Rhythm: 40px between reading sections, 12px inside a section, 24px between card regions, 6px plate gutter and frame inset.

**The Two-Page Spread Rule.** On desktop the plate is the left page and the text is the right page. Do not interleave photos into the reading column.

## Elevation & Depth

Flat. There are no shadows anywhere in the system. Depth and grouping come from hairline ink rules (1px), the 1px frame around the plate, and the one heavier rule: the 2px top and bottom rules of the warning banner. Desktop stickiness of the plate is the only layering.

**The Printed Page Rule.** If it could not be printed on a handbook page, it does not belong: no shadows, blurs, glows or gradients.

## Shapes

Square. Content panels, the plate frame, photo tiles, thumbnails and the warning banner have no radius (`rounded.panel`). The only softened corner in the tokens is a 2px control radius (`rounded.control`), used so far only by the inherited form controls on unpassed pages. Rules run full width of their column; the plate is a framed rectangle split 2 by 2 into 4:5 tiles. Key symbols are drawn as single-stroke SVG (1.75 stroke, round caps and joins) on a 16px box; scale marks are 8.5px squares with a 1.5 stroke.

## Components

### Site Header
- **Character:** a thin ruled masthead.
- **Style:** Archivo throughout, closed by one hairline ink rule under it. Wordmark in bold ink; nav links in Ink Grey that turn ink and underline on hover. Stacks wordmark over links on phones, sits in one baseline row from 640px. Includes a skip link that appears on focus.

### Photo Plate (signature)
- **Character:** a numbered field-guide plate.
- **Structure:** a 1px ink frame with 6px inset holding a 2 by 2 grid of 4:5 tiles (a fifth cut-wood tile only when the species has one). Each tile carries a 24px white plate-number tab, top left, with the number in bold plate green.
- **Empty tile:** Pale Sage fill with a centred small-label "no photo" note, so the plate keeps its shape.
- **Caption:** a numbered list below the plate in Label Small, number in plate green, slot name in semibold ink, then the photo credit and a linked licence in Ink Grey. Every photo shows author, licence and source here.

### Card Key (signature)
- **Character:** the symbol key of a field guide.
- **Structure:** a definition list ruled by hairlines above every row and below the last. Two columns (1 : 1.5): term in Ink Grey, value in semibold ink.
- **Marks:** a drawn symbol before the value (check, broadleaf, needles, scales in plate green; warning triangle in warning red), or three ochre squares filled to the step of a three-step scale.
- **Warning row:** value text turns warning red.

### Section
- **Style:** a Headline-size serif heading under a 1px ink rule with 12px above the text; content follows at 12px rhythm.
- **Identification list:** numbered items whose 24px plate numbers gain a 1px plate-green border, keying each paragraph back to its tile on the plate. Sub-heads are Archivo semibold.
- **Food-safety disclaimer:** Label Small text ruled above and below by hairlines, always shown.

### Warning Banner
- **Style:** Warning Wash background, 2px warning-red rules top and bottom, no side borders, square. Title in Archivo bold, uppercase with wide tracking; reason text in medium weight serif, all in warning red. Placed above the title visually but after the h1 in document order.

### Links
- **Style:** plate green, underlined (1px, 0.18em offset), turning ink on hover. Credit links in captions stay Ink Grey and turn ink on hover.
- **Focus:** a 2px plate-green outline, 2px offset, on every focusable element.

### Sources Disclosure
- **Style:** a native disclosure between two hairline rules, Archivo. The summary is semibold with a plate-green marker and turns green on hover; group headings are small uppercase tracked Ink Grey; sources are plate-green links in a bulleted list.

### Inherited controls (not yet passed)
The search form and filter key still use the pre-pass controls: 1px ink-bordered inputs and filled plate-green buttons with the 2px control radius, and checkbox toggles that fill green when checked. They consume the tokens but have not been designed in this world; treat them as provisional, not as the pattern for new surfaces.

## Do's and Don'ts

### Do:
- **Do** build hierarchy from hairline ink rules, weight and position before reaching for size or colour.
- **Do** key photos to text with plate numbers, and keep every photo's author, licence and source in the plate caption.
- **Do** put carving facts in a ruled key with drawn single-stroke marks and the three-step ochre scale.
- **Do** set reading text in the serif at 1.0625rem / 1.6 within the 38rem reading column.
- **Do** take every colour, family, title and body size, radius and container width from `src/styles/tokens.css`.
- **Do** keep the food-safety disclaimer and, for toxic species, the warning banner visible without interaction.

### Don't:
- **Don't** add shadows, gradients or rounded content panels; corners are square and the page is flat.
- **Don't** present a species' photos as a swipe carousel or its carving facts as chips or rounded cards.
- **Don't** use warning red on a species that is not toxic, or use it for emphasis elsewhere.
- **Don't** set text in ochre.
- **Don't** put a small label or kicker above the species name; the title opens the card.
