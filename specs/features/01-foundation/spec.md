# 01. Foundation: spec

Status: done
Milestone: 1 (see `specs/roadmap.md`)

## Problem

There is no application yet. Every later milestone needs a working Next.js + Payload app, a database, a styling base that can be swapped out wholesale, translations, tests and CI.

## Requirements

1. A Next.js 16 app with Payload 3 mounted at `/admin`, using Postgres (`architecture.md` §2).
2. Payload localization with `da` (default) and `en` (`architecture.md` §6).
3. next-intl routing with Danish at the root and English under `/en` behind a feature flag (`ENABLE_ENGLISH`). With the flag off, `/en` routes return 404.
4. A placeholder home page that renders a translated heading and links to the admin. No visual design yet: the UI stays neutral until the impeccable design pass.
5. All visual values (colour, type, spacing, radius) come from design tokens defined in one file, so the visual world can be replaced without touching components.
6. Tooling: pnpm, Biome (lint and format), strict TypeScript, Vitest (unit and integration), Playwright (end to end).
7. A GitHub Actions workflow that runs lint, type check, unit tests, integration tests against a Postgres service, a production build and Playwright on every PR.
8. Local development uses Postgres from `docker compose`. Database schema changes go through Payload migrations.
9. `.env.example` documents every environment variable. README explains how to run the app.

## Acceptance criteria

- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` pass.
- [x] `pnpm test:int` connects to Postgres and lists users via the Payload Local API.
- [x] `pnpm build` succeeds.
- [x] Playwright: `/` shows the Danish heading; `/en` returns 404 while English is disabled; `/admin` shows the Payload login.
- [x] CI runs all of the above on a PR.

## Out of scope

- Collections beyond `users` (milestone 3).
- Supabase Storage and image uploads (milestone 5).
- Any visual design.

## Open questions

- None.
