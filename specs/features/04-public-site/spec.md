# 04. Public site: spec

Status: agreed
Milestone: 4 (see `specs/roadmap.md`)

## Problem

Published cards have nowhere to be read. Visitors need the pages in product spec §4: home, species list, species card, where to get wood, and about.

## Requirements

1. Localized paths: `/arter`, `/arter/[slug]`, `/skaf-trae`, `/om` in Danish, `/species`, `/species/[slug]`, `/get-wood`, `/about` under `/en` (still hidden behind `ENABLE_ENGLISH`).
2. Home: intro, a search form, and links to the species list and "where to get wood".
3. Species list: search across the Latin name and every local name (ignoring case, accents and Danish letters), filters for use and green carving difficulty, and a thumbnail per species. Works without JavaScript (plain GET forms).
4. Species card: the fields in product spec §5 in order, warning banner first for warning species, photos per slot with credit lines, identification text next to its photo, look-alikes, the disclaimer under food safety, and sources collapsed by default and grouped by field.
5. Where to get wood and about: content from the Payload globals. About also shows the disclaimer and every image credit.
6. Only published species and selected photos are read (visitor access through the Payload Local API).
7. Placeholder styling only, through the shared components in `src/components/` and the tokens.

## Acceptance criteria

- [ ] "lind", "linden" and "Tilia cordata" all find small-leaved lime (unit and end-to-end).
- [ ] Only published species appear; unpublished species 404 (end-to-end).
- [ ] The disclaimer sits under food safety on every card and on the about page (end-to-end).
- [ ] Warning species show the banner above everything else (end-to-end).
- [ ] Sources are collapsed by default and grouped by field (end-to-end).
- [ ] Every photo shows a credit line (end-to-end).
- [ ] No horizontal scrolling at 360 px (end-to-end, mobile project).

## Out of scope

- The filter key page (milestone 7). Visual design (design pass D).
