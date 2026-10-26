# Treefinder

A free web app for wood carvers: a carving card per tree species (how it carves green and dry, what to make from it, how to dry it, food safety), plus reference photos and a filter key to identify the tree yourself. It launches in Danish, with a focus on Northern and Western European species.

## Status

MVP in progress. See [`specs/roadmap.md`](specs/roadmap.md). The UI is a neutral placeholder until the visual design pass.

## Running locally

Requires Node 24, pnpm 10 and Postgres (via Docker, or a local install).

```sh
cp .env.example .env
pnpm install
pnpm db:up          # Postgres in docker compose
pnpm migrate        # apply database migrations
pnpm dev            # http://localhost:3000, admin at /admin
```

| Command                       | What it does                            |
| ----------------------------- | --------------------------------------- |
| `pnpm lint` / `pnpm format`   | Biome check / fix                       |
| `pnpm typecheck`              | TypeScript                              |
| `pnpm test:unit`              | Unit tests (no database)                |
| `pnpm test:int`               | Integration tests against Postgres      |
| `pnpm build && pnpm test:e2e` | Playwright against the production build |
| `pnpm migrate:create <name>`  | New migration after a collection change |

## Specs

This project uses spec-driven development. Start with [`specs/README.md`](specs/README.md).

- [Constitution](specs/constitution.md): non-negotiable principles
- [Product spec](specs/product.md): what the app does
- [Architecture spec](specs/architecture.md): how it is built
- [Species list](specs/species.md): draft list with launch waves
- [Roadmap](specs/roadmap.md): milestones in build order

## Stack

Next.js 16, Payload CMS 3, Supabase (Postgres and Storage), Vercel, next-intl, Tailwind CSS 4, Biome, Vitest, Playwright and GitHub Actions.

## Working on this repo

See [`AGENTS.md`](AGENTS.md) for the workflow and conventions (used by both humans and coding agents).
