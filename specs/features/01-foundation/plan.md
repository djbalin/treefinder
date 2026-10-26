# 01. Foundation: plan

## Approach

Start from Payload's official `blank` template (create-payload-app 3.92, Postgres), then adapt it to the spec:

- **Versions:** Payload 3.92 with Next.js 16.4. Payload's own peer dependencies accept Next.js 16.3.3 and later, which resolves the version risk in `architecture.md`. Node 24 (Payload requires `^22.23.4 || >=24.22.1`).
- **Tooling:** ESLint and Prettier from the template are replaced by Biome, matching the maintainer's other projects.
- **Routing:** next-intl through `src/proxy.ts` (Next.js 16 renamed middleware to proxy), the same pattern as the time-picker app. Danish is the default locale with no prefix. English is only a locale when `ENABLE_ENGLISH=true`, so `/en` falls through to a Danish catch-all route and returns 404 while it is disabled.
- **Styling:** Tailwind CSS 4 with every visual value in `src/styles/tokens.css` (`@theme`). The values are deliberately neutral placeholders for the impeccable design pass.
- **Database:** `push: false`. Schema changes only through committed migrations. Production applies them on start via `prodMigrations`, which suits serverless deploys on Vercel.
- **Tests:** Vitest projects split `unit` (no database) from `int` (Payload Local API against Postgres). Playwright runs against `pnpm start` after a production build, never the dev server, on desktop and mobile Chromium.
- **Admin access:** only logged-in admins can create users. The first admin comes from Payload's first-user screen.

Rejected: Payload's `push` mode (it lets local and production schemas drift), and running Playwright against `next dev` (slower, and not what ships).

## Changes

| Area    | Files or modules                                                                           | Change                                                                                  |
| ------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| App     | `src/app/(frontend)/[locale]/*`, `src/app/(payload)/*`                                     | Locale layout, placeholder home page, localized not-found, Payload admin and API routes |
| i18n    | `src/i18n/*`, `src/proxy.ts`, `src/messages/*.json`, `src/global.d.ts`                     | Routing, request config, typed messages                                                 |
| Payload | `src/payload.config.ts`, `src/collections/Users.ts`, `src/migrations/*`                    | Postgres, localization, admin languages, initial migration                              |
| Styling | `src/styles/*`, `postcss.config.mjs`                                                       | Tailwind 4 and placeholder tokens                                                       |
| Tooling | `package.json`, `biome.json`, `tsconfig.json`, `vitest.config.mts`, `playwright.config.ts` | Scripts and config                                                                      |
| Ops     | `.github/workflows/ci.yml`, `docker-compose.yml`, `vercel.json`, `.env.example`            | CI with a Postgres service, local Postgres, Frankfurt region, env docs                  |

## Tests

| Acceptance criterion                          | Test                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| Lint, type check, unit tests pass             | `pnpm lint`, `pnpm typecheck`, `tests/unit/routing.test.ts` |
| Local API reaches Postgres                    | `tests/int/users.int.test.ts`                               |
| Build succeeds                                | `pnpm build`                                                |
| `/` Danish heading, `/en` 404, `/admin` login | `tests/e2e/foundation.e2e.ts`                               |
| CI runs all of the above                      | `.github/workflows/ci.yml`                                  |

## Risks and spec updates

- `architecture.md`: version risk marked resolved; migrations strategy recorded.
- `AGENTS.md`: placeholder-design rules, local setup, and spec-plus-code PRs for the MVP build-out.
- Roadmap: added a design pass (D) after milestone 7.
- Vercel deploys need `DATABASE_URL` and `PAYLOAD_SECRET` set in the Vercel project. The Supabase database password is not available through the connector, so the maintainer adds these.
