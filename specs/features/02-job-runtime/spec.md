# 02. Job runtime: spec

Status: agreed
Milestone: 2 (see `specs/roadmap.md`)

## Problem

The photo and drafting jobs call slow external APIs. A Claude call with web search can take minutes. The original plan ran Payload's job queue from Vercel Cron, but it was never checked whether that fits Vercel's limits or Payload's guidance.

## Findings

- **Payload:** the `jobs.autoRun` option "should not be used on serverless platforms like Vercel" (comment in Payload 3.92's `JobsConfig` type). On serverless, jobs must be run explicitly: `payload.jobs.run()`, `payload.jobs.runByID()`, or Payload's `/api/payload-jobs/run` endpoint.
- **Vercel:** functions have a maximum duration per plan, set per route with `maxDuration`. Cron schedules are limited on the Hobby plan. The exact current numbers could not be checked from the build environment: vercel.com does not resolve there, and the documentation search tool returned no limit tables. They must be checked in the Vercel dashboard before relying on long single calls.
- **Measurement:** a real Claude call with web search could not be timed yet. There is no API key, and Vercel has no database credentials. `scripts/measure-draft-call.ts` lands with milestone 6 so the timing can be taken as soon as a key exists.

## Requirements

1. Jobs never depend on frequent cron runs. A button in the admin queues the job and immediately starts running it in the same request, after the response has been sent (`after()` in a route handler with an explicit `maxDuration`).
2. A daily Vercel Cron call to `/api/payload-jobs/run` sweeps up any job that failed or was cut off. It is protected by `CRON_SECRET`.
3. Every job is split into short, idempotent tasks so a cut-off run resumes rather than restarts:
   - `fetchPhotoCandidates`: one task per source (Commons, iNaturalist).
   - `draftCard`: one task per group of card sections, each a single Claude call, with its output stored before the next task starts.
4. A task's runtime must stay well under the route's `maxDuration`. If the milestone 6 measurement shows a single Claude call is too slow, split the section groups further. Moving hosting (for example to Railway) is the fallback of last resort.

## Acceptance criteria

- [ ] `architecture.md` §5 describes this runtime model.
- [ ] Milestone 5 and 6 specs follow it (checked in their PRs).
- [ ] The measurement is recorded in `architecture.md` once a Claude API key exists (milestone 6).

## Out of scope

- Implementing the jobs (milestones 5 and 6).
