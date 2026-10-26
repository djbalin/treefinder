# 03. Data model: plan

## Approach

- **Pure rules in `src/domain/`:** publish rules, photo rules, slugs, the species table parser and rich text checks are plain functions with unit tests. Payload hooks only gather data and call them.
- **Shared option sets** (`src/domain/options.ts`) feed the collection selects now and the public site and filter key later, with Danish and English admin labels.
- **Publish rules** run in a `beforeChange` hook on `species` whenever the resulting status is `published`. When the edit is in English, the hook loads the Danish card and applies only the incoming non-localized fields, so the rules always judge the Danish text.
- **Photo uniqueness** is an `afterChange` hook that demotes other selected photos in the same slot. Simpler than a database constraint, and it gives the admin "replace" behaviour for free.
- **Status vs Payload drafts:** Payload's built-in drafts are not used. The card workflow has four states of its own, and versions still keep history.
- **Seed:** reads the spec table directly, so `specs/species.md` stays the single source of the species list. Look-alikes are matched by English name, as written in the spec.

## Changes

| Area     | Files                                                                                                                       | Change                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Domain   | `src/domain/*`                                                                                                              | Options, publish rules, photo rules, slug, rich text, species parser |
| Payload  | `src/collections/Species.ts`, `src/collections/Photos.ts`, `src/globals/pages.ts`, `src/access.ts`, `src/payload.config.ts` | Collections, globals, access                                         |
| Database | `src/migrations/*_data_model.*`                                                                                             | Migration                                                            |
| Seed     | `scripts/seed.ts`, `package.json`                                                                                           | `pnpm seed`                                                          |

## Tests

| Acceptance criterion                                                 | Test                                              |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| Publish rules                                                        | `tests/unit/publishRules.test.ts`                 |
| Publishing via the Local API, visitor visibility, one photo per slot | `tests/int/dataModel.int.test.ts`                 |
| Parser, slug, rich text, photo rules                                 | `tests/unit/domain.test.ts`                       |
| Seed is idempotent                                                   | Run twice locally: 40 species, 4 look-alike pairs |

## Risks and spec updates

- `architecture.md` §3: added the localized `name`, `alt` on photos, and noted that Payload drafts are not used.
