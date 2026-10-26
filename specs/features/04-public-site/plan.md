# 04. Public site: plan

## Approach

- **Data access:** `src/lib/payload.ts` wraps the Payload Local API with `overrideAccess: false`, so pages can only ever see what visitors may see.
- **Search:** the list is small (about 40 species), so all published species are loaded and filtered in memory by `filterSpecies` in `src/domain/search.ts`. A pure function is easy to test and avoids querying `hasMany` text columns.
- **Rendering:** pages that read Payload are `force-dynamic`, so builds never need a database and edits show up immediately. Caching can come later if traffic needs it.
- **No-JS first:** search and filters are GET forms, and sources use `<details>`.
- **Placeholder UI:** shared primitives in `src/components/ui.tsx` (badge, tag, warning banner, section, title) and a few page components, styled only with token utilities.
- **Static page text:** the seed writes starter Danish text for "where to get wood" (arborists, storm-felled trees, gardens, sankekort, selvskovning, winter season) and about. The admin edits it in Payload.

## Changes

| Area       | Files                                          | Change                                                                   |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Routing    | `src/i18n/routing.ts`                          | Localized pathnames                                                      |
| Pages      | `src/app/(frontend)/[locale]/**`               | Home, list, card, where to get wood, about                               |
| Components | `src/components/*`                             | UI primitives, header, search form, list item, photo, rich text, sources |
| Domain     | `src/domain/search.ts`, `src/domain/labels.ts` | Search and option labels                                                 |
| Seed       | `scripts/seed.ts`                              | Starter text for the static pages                                        |
| Messages   | `src/messages/*.json`                          | New strings                                                              |

## Tests

| Acceptance criterion                         | Test                                                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| Search                                       | `tests/unit/search.test.ts`, `tests/e2e/publicSite.e2e.ts` |
| Published only, 404                          | `tests/e2e/publicSite.e2e.ts`                              |
| Disclaimer, warning banner, sources, credits | `tests/e2e/publicSite.e2e.ts`                              |
| 360 px                                       | Playwright `mobile` project at 360 x 780                   |

End-to-end fixtures (`tests/e2e/fixtures.ts`) create published species with photos through the Local API before the run and remove them after.

## Risks and spec updates

- The "where to get wood" starter text is written from the Bolius and Naturstyrelsen pages cited in `product.md`. The maintainer should check it before launch.
