# C. Move to Convex: tasks

## C1: foundation

- [x] Convex project created; AI files and skills committed
- [x] Specs: architecture, constitution, product, roadmap, this feature folder
- [x] Schema
- [x] Public read queries (species list, species by slug, photos, pages)
- [x] Seed from `specs/species.md`, idempotent
- [x] Convex tests for visitor access and the seed

## C2: public site

- [x] Public pages read from Convex
- [x] Photos from Convex file storage
- [x] End-to-end tests against a Convex backend, locally and in CI (admin e2e skipped until C3)

## C3 and C4: admin, jobs and removal (one PR)

- [x] Admin role helper (`convex/lib/admin.ts`) and the placeholder login with a shared `ADMIN_SECRET`
- [x] Species list and editor, page editors
- [x] Review queue: drafted cards and photo candidates, keyboard shortcuts
- [x] Jobs as Convex actions: fetch photos, store photo, draft card
- [x] Payload, Postgres, migrations, docker compose, S3 settings and the Vercel cron removed
- [x] `.env.example`, README, AGENTS.md and CI updated
- [x] Admin end-to-end tests back on: publish flow and review queue
- [x] Update `specs/roadmap.md` status

## Maintainer

- [ ] Create the Clerk instance (Google sign-in, JWT template `convex`); then wire Clerk in place of the placeholder login and grant yourself the admin role (`users:grantAdmin`)
- [ ] Production Convex: create a deploy key, set `CONVEX_DEPLOY_KEY` in Vercel and the build command `npx convex deploy --cmd 'pnpm build'`
- [ ] Vercel: set `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SECRET`; remove `DATABASE_URL`, `PAYLOAD_SECRET`, `S3_*` and `CRON_SECRET`
- [ ] Convex production: `ADMIN_SECRET` and `ANTHROPIC_API_KEY` (with a spend limit), then `pnpm seed` against production
- [ ] Delete the Supabase project once nothing points at it
