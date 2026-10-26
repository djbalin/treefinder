# 06. Drafting pipeline: plan

## Approach

- **Model:** `claude-opus-5-5` (the current default) at effort `medium`, adaptive thinking (always on for this model), streamed with `finalMessage()`.
- **Refusals:** the server-side fallback (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) re-runs a declined request on a fallback model inside the same call. A refusal of the whole chain is an error.
- **Output:** a strict `submit_card` client tool whose schema is the section, instead of a structured output format. The Claude API reference says structured outputs can't be combined with citations, and web search returns cited text. Forced `tool_choice` returns a 400 on Opus 5.5, so the system prompt tells Claude to call the tool once at the end. A text answer gets one nudge; `pause_turn` is resumed by re-sending the assistant turn; at most five turns.
- **Web search:** `web_search_20260209`, at most five searches per section.
- **Saving:** `buildDraftUpdate` turns a submission into a Danish update with values checked again, so nothing invalid reaches the database even though the schema is strict.
- **Runtime:** one workflow with three tasks, run after the response by the API route. With three web-searching calls in one run, the route's `maxDuration` is raised from 60 to 300 seconds, and each call times out after 90 seconds (`DRAFT_TIMEOUT_MS`).
- **CI guard:** CI now fails when collections change without a migration (`migrate:create --skip-empty` must not create a file). This milestone's first test run caught exactly that mistake.

## Changes

| Area      | Files                                                            | Change                                                                    |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Drafting  | `src/lib/drafting/*`                                             | Sections and schemas, Claude call loop, update builder, per-section draft |
| Jobs      | `src/jobs/draftCard.ts`, `src/payload.config.ts`                 | Three tasks and the workflow                                              |
| Endpoints | `src/endpoints/adminActions.ts` (renamed from `photoActions.ts`) | `POST /api/species/:id/draft-card`                                        |
| Admin     | `src/components/admin/*`                                         | Shared `QueueButton`, cards in the review queue, draft action on species  |
| Script    | `scripts/measure-draft-call.ts`, `pnpm measure:draft`            | Times one real call                                                       |
| Ops       | REST route, `.env.example`, `.github/workflows/ci.yml`           | `maxDuration = 300`, `ANTHROPIC_API_KEY`, migration check                 |
| Database  | `src/migrations/*_drafting.*`                                    | Job type enums                                                            |

## Tests

| Acceptance criterion                 | Test                                     |
| ------------------------------------ | ---------------------------------------- |
| Request shape, pause, nudge, refusal | `tests/unit/drafting.test.ts`            |
| Update builder                       | `tests/unit/drafting.test.ts`            |
| Workflow, approved untouched         | `tests/int/drafting.int.test.ts`         |
| AI draft to published in the admin   | `tests/e2e/publishFlow.e2e.ts` (desktop) |

## Risks and spec updates

- `architecture.md` §5: route `maxDuration` 300 s, and three Claude calls per run.
- **Not measured yet:** no API key was available. Run `pnpm measure:draft smaabladet-lind carving` once a key exists, and record the result in `architecture.md`.
- **Unverified:** a `maxDuration` of 300 s must be allowed by the Vercel plan. If the deploy rejects it, lower it and split the workflow into one run per section.
