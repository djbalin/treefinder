# 06. Drafting pipeline: spec

Status: done
Milestone: 6 (see `specs/roadmap.md`)

## Problem

Writing 40 carving cards with a source for every claim is the slowest part of launching. An AI draft with sources, checked by the admin, cuts that down without giving up the constitution's "no unchecked claims" rule (product spec §7.4).

## Requirements

1. A "Skriv AI-udkast" (draft card) action per species, on the species page and in the review queue, queues a job that runs right after the response.
2. The card is drafted in three sections, each one Claude call with web search, saved before the next starts:
   - carving: green carving, dry hardness and Janka, grain, colour and smell, uses, riving, drying
   - safety: food safety and toxicity, plus a warning reason for toxic species
   - identification: leaf, bark, winter twig, shape, cut wood, filter key traits, and local names in Swedish, Norwegian, German, Dutch and English
3. Danish, in the "experienced friend" voice from `PRODUCT.md`, with a source for each field drawn from the web search.
4. Only cards in AI draft or Needs changes are drafted. Approved and published cards are never overwritten. A draft never ticks the food safety check, never clears a warning flag, and keeps the Danish names from the species list.
5. Invalid values (unknown options, non-http URLs, sources for other sections) are dropped, not stored.
6. The review queue lists AI drafts with content and approved cards, oldest first.
7. A script times one real drafting call (milestone 2 follow-up).

## Acceptance criteria

- [x] The Claude request uses `claude-opus-5-5`, web search, a strict submit tool and refusal fallbacks; paused turns resume and text answers are asked again (unit, fake client).
- [x] Building the update drops invalid values and keeps other sections' sources (unit).
- [x] The workflow drafts all three sections, and leaves approved cards alone (integration, fake Claude).
- [x] An AI draft is published from the admin and appears on the site (end-to-end).

## Out of scope

- English drafts (milestone 9).
