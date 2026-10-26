# C. Move to Convex: plan

## Approach

Move in four PRs so the site keeps working at every step: build the Convex backend next to Payload (C1), switch the public site to it (C2), build the admin and jobs on it (C3), then delete Payload and Supabase (C4).

Key decisions:

- **Shared domain logic:** pure functions stay in `src/domain/` and are imported by Convex functions through relative paths, so the app and the backend apply the same rules.
- **Content format:** Payload's Lexical rich text becomes Markdown strings, which an admin textarea edits directly and the drafting job writes naturally.
- **Localization:** fields are `{ da, en? }` objects instead of Payload field localization.
- **Server rendering:** public pages call Convex with `fetchQuery` from `convex/nextjs` on the server, so pages stay server-rendered and need no client provider.
- **Jobs:** Convex actions scheduled from mutations, with a `jobs` table for status. Rejected: Convex Workflow components, which add more than three short jobs need.
- **Auth:** Clerk with roles in Convex `users` (maintainer's choice). Rejected: Convex Auth, whose Google sign-in needs more setup, and is still in beta.

## Changes

| Area    | Files or modules                                                   | Change                                                 |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| Backend | `convex/schema.ts`, `convex/*.ts`                                  | Schema, public queries, admin functions, actions, seed |
| Shared  | `src/domain/`                                                      | Rich text helpers become Markdown helpers              |
| Site    | `src/app/(frontend)/`, `src/components/`, `src/lib/`               | Payload calls replaced with Convex queries             |
| Admin   | `src/app/admin/`                                                   | New admin pages                                        |
| Removal | Payload config, collections, endpoints, migrations, docker compose | Deleted in C4                                          |

## Tests

| Acceptance criterion             | Test                                |
| -------------------------------- | ----------------------------------- |
| Visitor access                   | `convex/*.test.ts` (convex-test)    |
| Seed and idempotency             | `convex/seed.test.ts`               |
| Publish enforcement, photo slots | `convex/*.test.ts`                  |
| Admin role checks                | `convex/*.test.ts`                  |
| Public site                      | `tests/e2e/*.e2e.ts` against Convex |

## Risks and spec updates

- `architecture.md` is rewritten, the constitution names Convex as the content store, and the product spec drops its Payload mentions (all in C1).
