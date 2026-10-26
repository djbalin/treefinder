# 03. Data model: spec

Status: done
Milestone: 3 (see `specs/roadmap.md`)

## Problem

The app has no content model. Cards, photos, the static pages and the publish workflow (product spec §5 to §8) need Payload collections and server-side rules before any page or pipeline can be built.

## Requirements

1. `species` collection with every card field from product spec §5 and the data model in `architecture.md` §3, plus a localized display `name`. Localized fields follow the table there. Versions are kept.
2. `photos` upload collection (architecture §3). A photo can exist without a file (candidates only hold a link). Every photo carries author, license and attribution.
3. Globals `whereToGetWood` and `about` with a localized title and rich text.
4. Card states `aiDraft`, `needsChanges`, `approved`, `published`. Photo states `candidate`, `selected`, `rejected`.
5. The publish rules (product spec §7.3) are enforced server-side, judged on the Danish card whatever locale the edit was made in.
6. Selecting a photo requires a slot, and demotes any other selected photo of the same species and slot to candidate.
7. Visitors only see published species and selected photos. Only admins can create, change or delete anything.
8. A seed script loads `specs/species.md` into `species` without overwriting card content, links look-alikes both ways, sets page titles, and optionally creates the first admin.

## Acceptance criteria

- [x] Each publish rule has a unit test.
- [x] Publishing an incomplete card through the Local API fails; a complete card publishes (integration test).
- [x] Visitors cannot read unpublished species or non-selected photos (integration test).
- [x] One selected photo per slot (unit and integration test).
- [x] The species table parser reads all 40 species, 18 launch species and 3 warnings (unit test).
- [ ] The seed runs twice without duplicating anything.

## Out of scope

- Fetching photo files (milestone 5), the review queue (milestones 5 and 6), the public pages (milestone 4).
