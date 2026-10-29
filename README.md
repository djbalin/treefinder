# Treefinder

A free web app for wood carvers: a carving card per tree species (how it carves green and dry, what to make from it, how to dry it, food safety), plus reference photos and a filter key to identify the tree yourself. It launches in Danish, with a focus on Northern and Western European species.

## Status

MVP in progress. See [`specs/roadmap.md`](specs/roadmap.md). The visual design is in progress with the impeccable skill; see [`DESIGN.md`](DESIGN.md).

## Running locally

Requires Node 24, pnpm 10 and a Convex account.

```sh
pnpm install
npx convex dev      # creates or picks your dev deployment, writes .env.local, keeps pushing functions
pnpm seed           # the 40 species from specs/species.md and the static pages
pnpm dev            # http://localhost:3000, admin at /admin (admin/admin in development)
```

Set `ADMIN_SECRET` in `.env.local` and the same value in Convex (`npx convex env set ADMIN_SECRET ...`). Card drafting needs `ANTHROPIC_API_KEY` in Convex.

| Command                       | What it does                                   |
| ----------------------------- | ---------------------------------------------- |
| `pnpm lint` / `pnpm format`   | Biome check / fix                              |
| `pnpm typecheck`              | TypeScript                                     |
| `pnpm test:unit`              | Unit tests                                     |
| `pnpm test:convex`            | Convex function tests (convex-test, in memory) |
| `pnpm build && pnpm test:e2e` | Playwright against the production build        |
| `pnpm check:filter-key`       | Filter key acceptance check on the real data   |

## Specs

This project uses spec-driven development. Start with [`specs/README.md`](specs/README.md).

- [Constitution](specs/constitution.md): non-negotiable principles
- [Product spec](specs/product.md): what the app does
- [Architecture spec](specs/architecture.md): how it is built
- [Species list](specs/species.md): draft list with launch waves
- [Roadmap](specs/roadmap.md): milestones in build order

## Stack

Next.js 16, Convex (database, file storage, functions and jobs), Vercel, next-intl, Tailwind CSS 4, Biome, Vitest, Playwright and GitHub Actions. Admin sign-in moves to Clerk once its instance exists.

## Working on this repo

See [`AGENTS.md`](AGENTS.md) for the workflow and conventions (used by both humans and coding agents)
