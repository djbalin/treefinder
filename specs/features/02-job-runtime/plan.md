# 02. Job runtime: plan

## Approach

Documentation-only milestone. The runtime model in `spec.md` replaces "Payload jobs queue triggered by Vercel Cron" in `architecture.md`. The implementation lands with the first job (milestone 5):

- a `src/app/(payload)/api/jobs/start/route.ts`-style handler (exact path decided in milestone 5) that checks the admin session, calls `payload.jobs.queue()`, and runs the job with `after(() => payload.jobs.runByID(...))`, with `export const maxDuration` set on the route;
- `vercel.json` `crons` entry for the daily sweep, authorized with `CRON_SECRET`.

Rejected: `jobs.autoRun` (Payload says not to use it on serverless) and per-minute cron (may not be available on the Hobby plan, and wasteful for a single admin).

## Changes

| Area  | Files                   | Change                                                       |
| ----- | ----------------------- | ------------------------------------------------------------ |
| Specs | `specs/architecture.md` | §2 stack row and §5 jobs rewritten for the new runtime model |

## Tests

None in this milestone. Milestones 5 and 6 test the job handlers.

## Risks and spec updates

- Vercel limits are unverified. Before milestone 6 goes live, check the project's plan limits in the Vercel dashboard.
