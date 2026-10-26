# 07. Filter key: spec

Status: agreed (MVP, to be evaluated by the maintainer)
Milestone: 7 (see `specs/roadmap.md`)

## Problem

Browsing 40 species to identify a tree is tedious. Product spec §6.2 defines a six-trait filter key that narrows the list.

## Requirements

1. A page at `/find-traeet` (`/en/identify`), linked from the header and the home page.
2. The six traits and values from product spec §6.2, as tappable chips. Nothing picked means "don't know".
3. Matching: any picked value within a trait; every answered trait across traits; unanswered traits ignored; several values per species allowed.
4. Results update as chips are picked, with a count, and the selection is kept in the URL so it can be shared. Without JavaScript the same form submits as a GET request.
5. Each result shows a thumbnail (leaf, else whole tree), the name, and the one or two traits that set it apart from the other results.
6. A winter hint: bud arrangement, bark and thorns work without leaves.
7. A script runs the launch acceptance check against the real launch species.

## Acceptance criteria

- [ ] Matching rules, distinguishing traits, URL parsing and the acceptance check have unit tests.
- [ ] Picking and resetting traits narrows and restores the list, and the URL follows (end-to-end).
- [ ] A selection in the URL is applied on load (end-to-end).

## Out of scope

- Line icons per value (design pass D).
- Traits are filled by the drafting job (milestone 6) or by hand; this milestone does not author them.
