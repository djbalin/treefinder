# Treefinder: agent instructions

Treefinder is a free web app (mobile first) for wood carvers. Each tree species gets a carving card plus reference photos and a filter key so users can identify the tree themselves. Content is reviewed by a single admin through a Payload CMS dashboard.

## Spec-driven development

The specs in `specs/` are the source of truth. Code follows the specs, not the other way round.

- Read `specs/constitution.md` before any change. Its rules are non-negotiable.
- `specs/product.md` covers what the app does, `specs/architecture.md` covers how it is built, and `specs/roadmap.md` lists the milestones in order.
- Before implementing a milestone, create `specs/features/NN-name/` from `specs/_template/` (`spec.md`, `plan.md`, `tasks.md`). For the MVP build-out, the feature spec and its implementation may ship in the same PR, and the maintainer reviews both together.
- If implementation shows a spec is wrong or incomplete, update the spec in the same PR and say so in the PR description. Never let code and spec drift apart silently.
- Tick off tasks in the feature's `tasks.md` and update the milestone's status in `specs/roadmap.md` as part of the PR.

## Workflow

- One PR per milestone or feature, branched from `main`. Never commit directly to `main`.
- Keep commits small and meaningful. The git history is part of the portfolio.
- CI must be green: lint, type check, unit tests and Playwright.
- NEVER run the dev server (`pnpm dev`, `next dev`, etc.) after making changes. After finishing a task, stop and let the maintainer verify by running the server themselves.

## Visual design

The visual direction is set with the impeccable design skill, one page at a time (milestone D). `PRODUCT.md` holds the product context and `DESIGN.md` describes the current visual world; direction briefs per page live in `.impeccable/surfaces/`.

- Read `DESIGN.md` before changing any UI, and follow it.
- Every visual value comes from the tokens in `src/styles/tokens.css`. Never hardcode colours, fonts or sizes in components.
- Build pages from small shared components in `src/components/`, and draw icons with the glyph set in `src/components/Glyph.tsx`.
- Do not edit `DESIGN.md` by hand. Impeccable regenerates it after a design pass.

## Local setup

- Node 24 and pnpm 10. Postgres from `pnpm db:up` (docker compose) or any local Postgres matching `DATABASE_URL` in `.env`.
- Schema changes: edit collections, then `pnpm migrate:create <name>` and commit the migration. Payload never pushes schema automatically.
- Tests: `pnpm test:unit`, `pnpm test:int` (needs the database), `pnpm build && pnpm test:e2e` (runs against the production build).

## Stack notes

- **Next.js 16:** this version has breaking changes. APIs, conventions and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.
- **Payload 3** runs inside the Next.js app. Check the installed Payload version's docs and changelog rather than relying on memory.
- **Package manager:** pnpm. **Lint and format:** Biome.

## Code conventions

- TypeScript everywhere, strict mode.
- When creating in-file sub-components in a React file, place them after the main component of the file.
- User-facing strings go through next-intl. Danish is the default locale. Never hardcode UI text.
- Card content lives in Payload with field localization. Never hardcode species content in the app.
- Secrets only in environment variables. Keep `.env.example` up to date.
- No debug output (`console.log` and the like) on `main`.
