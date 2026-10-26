# C. Move to Convex: spec

Status: agreed
Milestone: see `specs/roadmap.md`

## Problem

Payload CMS and Supabase carry a lot of weight for one admin and about 40 species: a Postgres database with migrations, an S3 storage adapter, Payload's jobs queue that cannot run on its own on Vercel, a Vercel cron to sweep it, and a dev server that reloads Payload on every edit. The maintainer wants to learn and use Convex instead: one backend for data, file storage, functions and background jobs, with Clerk for admin sign-in and roles in a `users` table.

The public site must keep working exactly as it does now while the backend underneath it changes. See `architecture.md` for the target design.

## Requirements

1. **C1, foundation:** the Convex schema from `architecture.md` §3, public read queries, the seed from `specs/species.md` and Convex tests. Payload stays in place.
2. **C2, public site:** every public page reads from Convex instead of Payload, with photos served from Convex file storage. The end-to-end tests run against a Convex backend.
3. **C3, admin and jobs:** an admin under `/admin` with a species list and editor, the review queue (photos and drafts), the two page editors, and the photo and drafting jobs as Convex actions. Admin functions require the `admin` role. Clerk is wired in, with a placeholder login until the Clerk instance exists (`architecture.md` §6).
4. **C4, removal:** Payload, Postgres, the migrations, docker compose, the S3 settings and the Vercel cron are removed. `.env.example`, the README, AGENTS.md and CI only describe Convex and Clerk.
5. Business rules keep their existing unit tests: publish rules, one selected photo per slot, the license filter, search and the filter key.

## Acceptance criteria

- [x] The schema matches `architecture.md` §3, and `convex dev` deploys it.
- [x] Visitors can read only published species, their selected photos and the pages (Convex test).
- [x] The seed creates all 40 species and runs twice without duplicating anything (Convex test).
- [ ] Publishing a card that breaks a publish rule throws (Convex test).
- [ ] Selecting a photo demotes the previously selected photo in that slot (Convex test).
- [ ] Every admin function refuses a caller without the `admin` role (Convex test).
- [ ] The public end-to-end tests pass against Convex.
- [ ] No Payload, Postgres or Supabase dependency, file or environment variable is left (C4).

## Out of scope

- Restyling the admin beyond the design tokens.
- Moving content from a production Payload database: there is no published content yet, so the seed is the starting point.

## Open questions

- CI backend for end-to-end tests: a local Convex backend or a preview deployment (decided in C2).
