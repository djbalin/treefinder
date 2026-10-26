---
name: Treefinder
description: Carving cards for wood carvers, set as flat Scandinavian enamel signs over a wall of tree photos.
colors:
  surface: "#f7f8f5"
  surface-muted: "#e9ece4"
  ink: "#15213d"
  ink-muted: "#4a5470"
  line: "#15213d"
  accent: "#20409a"
  accent-ink: "#ffffff"
  plate: "#2e6b3f"
  plate-ink: "#ffffff"
  key: "#20409a"
  warning: "#c8322b"
  warning-ink: "#ffffff"
  warning-surface: "#fbe9e7"
typography:
  title:
    fontFamily: "Gabarito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  sign:
    fontFamily: "Gabarito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.05
  route:
    fontFamily: "Gabarito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
  nav:
    fontFamily: "Gabarito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Gabarito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  panel: "0.25rem"
  control: "0.375rem"
  badge: "9999px"
spacing:
  wall: "6px"
  pill: "8px"
  band: "12px"
  gutter: "16px"
  section: "16px"
  page-top: "24px"
  page-top-wide: "40px"
  page-bottom: "64px"
components:
  site-header:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.nav}"
    padding: "10px 16px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  search-submit:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    padding: "6px 16px"
  search-submit-hover:
    backgroundColor: "{colors.plate}"
  use-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "4px 12px 4px 8px"
  use-pill-hover:
    backgroundColor: "{colors.surface-muted}"
  use-pill-picked:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  tree-tile:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.panel}"
  name-band:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    typography: "{typography.sign}"
    padding: "8px 12px 12px"
  name-band-toxic:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning-ink}"
  factor-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.badge}"
    size: "28px"
  route-bar-cobalt:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.route}"
    rounded: "{rounded.panel}"
    padding: "16px"
  route-bar-cobalt-hover:
    backgroundColor: "{colors.plate}"
  route-bar-green:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    typography: "{typography.route}"
    rounded: "{rounded.panel}"
    padding: "16px"
  route-bar-green-hover:
    backgroundColor: "{colors.accent}"
---

# Design System: Treefinder

## Overview

**Creative North Star: "The Enamel Sign Wall"**

Treefinder looks like a row of Scandinavian enamel signs posted over the trees they name. The colour is flat and solid, picked from a small fixed set with no tints between, and it sits on a near-white ground. Photos come first: the home page is a wall of tree photos, and each tile carries a full-width green name band with the tree's name in big type and a fixed row of round factor badges. The visitor recognises the tree by its photo, sees at a glance how it carves, how hard it dries and whether it is food safe, and taps it.

The world is direct and bright without being loud. Two typefaces do all the work: Gabarito, a sturdy geometric sans, for names, navigation, labels and actions, and Figtree for running text. Glyphs are authored on one 24px grid with one stroke weight, and they carry the carving factors so the page needs fewer words. A glyph never stands alone; a visible label or a screen-reader label always carries the meaning.

The maintainer rejected three things outright: yellow (it read as IKEA), a logo or wordmark, and sign costume (keylines, rivets, arrow plates, borders drawn to look like a sign). The world is enamel colour, not enamel props. The forest-hero-over-chip-cards look of nature apps is also out.

**Scope of this pass.** Only the home page and the shared header and search have had their pass in this world. The species card, species list, filter key, static pages (where to get wood, about, not found) and the Payload admin inherit the tokens only and still use field-guide-era layout components (for example the card key and photo plate on the species card). Treat their current look as unreviewed, not as precedent; each gets its own pass.

**Key Characteristics:**
- Flat enamel colour from a fixed set: ink, cobalt, forest green, signal red, on near-white.
- Photos lead; colour arrives as solid bands and bars, never as tinted washes.
- Gabarito for every name, label and action; Figtree for text.
- Authored single-weight glyphs carry the carving factors, always with a label.
- Small radii, no shadows, no gradients, no keylines.

## Colors

A small fixed set of solid enamel colours, each with one job, on a near-white ground.

### Primary
- **Enamel Cobalt** (accent): links, actions, the picked use, the search button, glyphs on factor badges, and the cobalt route bar. Also the focus ring and text selection colour.

### Secondary
- **Forest Plate Green** (plate): the name band under every non-toxic tree photo, the food-safe check glyph, the green route bar, and the hover colour of cobalt actions.

### Tertiary
- **Signal Red** (warning): only toxic species. It replaces the green name band on their tiles and colours the warning glyph. It never decorates anything else.
- **Warning Wash** (warning-surface): the pale ground of disclaimer and warning panels on inherited surfaces. It is the one sanctioned tint and stays tied to safety text.

### Neutral
- **Night Ink** (ink): body text and the solid header bar.
- **Slate Ink** (ink-muted): secondary text such as the use-row label, the badge legend, photo credits and placeholders.
- **Paper White** (surface): the page ground, the search field, and the round factor badges.
- **Lichen Grey** (surface-muted): the empty tile behind a missing photo and the hover fill on unpicked use pills.
- **White Enamel** (accent-ink, plate-ink, warning-ink): text and glyphs on cobalt, green and red.
- **Line** (line) and **Key** (key) are aliases of ink and cobalt kept for the inherited field-guide components. The home world draws no keylines.

### Named Rules
**The Fixed Set Rule.** Colour comes only from the tokens above, at full strength. No opacity tints, gradients or in-between shades; Lichen Grey and Warning Wash are the only light variants.

**The Red Means Toxic Rule.** Signal red appears only where a species is toxic or a safety warning is shown. A red band is a warning, never decoration.

**The No Yellow Rule.** There is no yellow or warm gold in this world. The maintainer rejected it as too IKEA.

## Typography

**Display Font:** Gabarito (with ui-sans-serif, system-ui, sans-serif), loaded with next/font as `--font-sign`
**Body Font:** Figtree (with ui-sans-serif, system-ui, sans-serif), loaded with next/font as `--font-text`
**Label Font:** Gabarito for labels, pills and buttons; Figtree for form input text

**Character:** Gabarito is the sign lettering: heavy, round and plain, legible over a photo at small sizes. Figtree is the quiet companion for anything read as sentences.

### Hierarchy
- **Title** (800, 2.5rem, 1.02, -0.015em): the page heading on content pages. The home page heading is for screen readers only; the tree names lead.
- **Sign** (800, 1.375rem, 1.05, balanced wrapping): the tree name on a name band.
- **Route** (800, 1.25rem): the text on the closing route bars.
- **Nav** (600, 1rem): header links.
- **Label** (700, 0.875rem): the use-row label, use pills, the badge legend (600) and the search button.
- **Body** (400, 1.0625rem, 1.6): running text, kept within the 38rem reading column on text pages.
- **Small** (400, 0.875rem): photo credits and other fine print.

### Named Rules
**The Sign Face Rule.** Anything a carver taps or scans (names, nav, pills, buttons, legends) is set in Gabarito. Figtree is for sentences.

## Layout

Mobile first, readable at 360px. The page sits in a 72rem container with 16px side padding; text pages use a 38rem reading column. The header is a slim ink bar: on phones the links scroll in one row with the search full width beneath them; from 640px the search moves right at 20rem.

The home page stacks in 16px steps: a small use-row label over one horizontal row of use pills (on phones it scrolls sideways edge to edge with snap; from 640px it wraps), a one-line badge legend, then the photo wall. The wall is two columns on phones, three from 640px and four from 1024px, with a tight 6px gutter so the tiles read as one wall. Two route bars close the page (stacked on phones, side by side from 640px), followed by the photo credits.

Page top padding is 24px (40px from 640px) and bottom padding 64px.

## Elevation & Depth

The system is flat. There are no shadows, gradients or blur. Depth comes from solid colour layered over photos: the name band sits flush on the bottom edge of its photo, and the white factor badges sit on the band. The only motion is a slow photo zoom (scale 1.05 over 500ms, ease-out) on tile hover, and colour swaps on hover.

### Named Rules
**The Flat Enamel Rule.** No box shadows, no gradients, no translucency. A surface is either a photo or a solid colour.

## Shapes

Square-cut forms with small radii: 4px on panels (tiles, route bars) and 6px on controls (pills, search). The factor badges are the only round shapes, 28px circles. Controls carry a 2px cobalt border; panels have no border at all. Photos are cropped to a 3:4 portrait inside their tile.

## Components

### Site Header
A slim ink bar, the same on every page.
- **Style:** ink background, near-white Gabarito links (semibold), underline on hover. No logo or wordmark.
- **Search:** sits in the bar (see Inputs).
- **Skip link:** hidden until focused, then shown as a near-white box at the top left.

### Buttons and Route Bars
- **Search button:** cobalt with white bold Gabarito, joined to the field, turns forest green on hover.
- **Route bars:** full-width solid bars, 4px radius, 16px padding, extrabold Gabarito 1.25rem with an arrow glyph pushed to the right. One cobalt (to the filter key), one green (to where to get wood). On hover each swaps to the other colour.

### Chips (Use Pills)
- **Style:** 2px cobalt border, 6px radius, cobalt glyph plus bold Gabarito label, compact padding (4px top and bottom, 8px left, 12px right).
- **State:** unpicked pills are outlined and fill Lichen Grey on hover. The picked pill fills solid cobalt with white text and carries `aria-current`; tapping it again clears the filter. Only the picked pill fills.

### Cards / Containers (Tree Tile)
The signature component.
- **Corner Style:** 4px radius, clipped.
- **Background:** the photo (whole tree, falling back to leaf) covering a 3:4 tile; Lichen Grey with a short message when there is no photo.
- **Name band:** a full-width forest green band flush with the bottom edge (signal red for toxic species), padded 8px top, 12px sides and bottom, carrying the name in Sign type and, for toxic species only, a bold uppercase status line naming the toxicity.
- **Factor badges:** three white 28px circles in a fixed order (carvability, dry hardness, food safety), 6px apart. An empty circle holds the cell when a value is missing, so trees compare at a glance. Each badge has a label for screen readers and a title tooltip.
- **Shadow Strategy:** none (see Elevation & Depth).

### Inputs / Fields
- **Style:** a near-white field with a 2px cobalt border and 6px radius, Figtree text in ink, Slate Ink placeholder, and the cobalt submit button joined on the right.
- **Behaviour:** a plain GET form to the species list, so search works without JavaScript.
- **Focus:** the global focus ring, a 2px cobalt outline offset 2px, on every focusable element.

### Glyphs
An authored set on a 24px grid, 2px stroke, round caps and joins, drawn in the current text colour. Use glyphs (spoons, bowls, kuksa, figures, handles, spatulas, boxes), status glyphs (check, warning, unknown), leaf-type glyphs and an arrow. Two glyphs encode values by count, so levels stay distinct at badge size:
- **Carvability:** knife cuts, one for easy, two for medium, three for hard (2.5px stroke).
- **Dry hardness:** three rising bars, filled up to the level.
Food safety shows a green check, a red warning for toxic species, or a muted question mark when unchecked. The badge legend above the wall decodes the three badges in the same order.

## Do's and Don'ts

### Do:
- **Do** take every colour, font and radius from `src/styles/tokens.css`, at full strength.
- **Do** lead with photos: tree imagery fills the tile and colour arrives as a solid band beneath it.
- **Do** keep the three factor badges in a fixed order (carvability, hardness, food safety) and hold an empty cell when a value is missing.
- **Do** pair every glyph with a visible label or a screen-reader label.
- **Do** set names, nav, pills and buttons in Gabarito and running text in Figtree.
- **Do** keep hover as a colour swap within the fixed set (cobalt to green, outline to Lichen Grey).

### Don't:
- **Don't** use yellow or warm gold anywhere.
- **Don't** add a logo or wordmark to the header.
- **Don't** dress components as signs: no keylines, rivets, double borders or arrow-shaped plates.
- **Don't** use shadows, gradients, translucent overlays or tints between the fixed colours.
- **Don't** use signal red for anything but toxicity and safety warnings.
- **Don't** treat the species card, species list, filter key or static pages as examples of this world until they have had their own pass.
