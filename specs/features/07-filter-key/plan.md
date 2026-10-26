# 07. Filter key: plan

## Approach

- **Logic in `src/domain/filterKey.ts`:** matching, distinguishing traits, URL encoding and the acceptance check are pure functions shared by the page, the tests and the script.
- **Page:** a server component loads published species and thumbnails, then hands them to a client component. With about 40 species, filtering in the browser is instant and needs no round trip.
- **No-JS:** the chips are real checkboxes in a GET form, and a submit button shows inside `<noscript>`. The server applies the selection from the URL, so the no-JS result matches.
- **URL:** `history.replaceState` keeps the query in step without adding history entries.
- **Acceptance check:** the product spec asks for a Vitest check "on the seed data", but `specs/species.md` holds no traits. Traits arrive through drafting and review. So the check is a pure function with unit tests, plus `pnpm check:filter-key`, which runs it against the launch species in the database before launch.

## Changes

| Area            | Files                                                                              | Change                                                 |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Domain          | `src/domain/filterKey.ts`                                                          | Matching, distinguishing traits, URL, acceptance check |
| Page            | `src/app/(frontend)/[locale]/find-traeet/page.tsx`, `src/components/FilterKey.tsx` | Filter key page                                        |
| Routing and nav | `src/i18n/routing.ts`, `src/components/SiteHeader.tsx`, home page, messages        | `/find-traeet` and `/en/identify`                      |
| Script          | `scripts/check-filter-key.ts`, `pnpm check:filter-key`                             | Launch check against the database                      |

## Tests

| Acceptance criterion | Test                           |
| -------------------- | ------------------------------ |
| Logic                | `tests/unit/filterKey.test.ts` |
| Narrow, reset, URL   | `tests/e2e/filterKey.e2e.ts`   |

## Risks and spec updates

- `product.md` §6.2: the acceptance check runs on the database via `pnpm check:filter-key` rather than on seed data. The spec is updated.
- Leaf edge "smooth" and bark "smooth" share the Danish label "Glat". A better leaf-edge label ("helrandet") is a copy decision for the design pass.
