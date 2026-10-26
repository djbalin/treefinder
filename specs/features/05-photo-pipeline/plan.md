# 05. Photo pipeline: plan

## Approach

- **Sources** (`src/lib/photoSources/`): small clients with an injectable `fetch`, plus pure parsers. Commons uses `generator=categorymembers` with `imageinfo` and `extmetadata` for license and author. iNaturalist finds the taxon by exact name, then fetches research-grade observations with `photo_license=cc0,cc-by,cc-by-sa`, swapping the square thumbnail for the large size.
- **Licenses** (`src/domain/licenses.ts`): one normaliser for both sources. Ported licenses ("cc-by-sa-3.0-de") keep their base terms. iNaturalist reports licenses without a version, so `CC-BY` and `CC-BY-SA` were added as unversioned values.
- **Jobs** (`src/jobs/fetchPhotoCandidates.ts`): a workflow with one task per source, each retried twice, so a failed source does not redo the other.
- **Endpoints** (`src/endpoints/photoActions.ts`): `POST /api/species/:id/fetch-photos` queues and runs the workflow with `after()`. `POST /api/photos/:id/select` and `/reject` handle review actions. All require an admin session. The REST route sets `maxDuration = 60`.
- **Download on select** (`src/lib/photos.ts`): only `upload.wikimedia.org` and iNaturalist's image hosts over https, images only, at most 15 MB.
- **Storage:** `@payloadcms/storage-s3` is enabled when `S3_BUCKET` is set (Supabase Storage's S3 endpoint); otherwise files go to `./media`.
- **Admin UI:** a custom Payload view (`ReviewQueue`), a client grid with slot buttons and keyboard shortcuts, a fetch button, a nav link, and a `ui` field with actions on each species. Admin copy is Danish, written in the components: it is admin-only and outside next-intl.

## Changes

| Area      | Files                                                       | Change                                                 |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| Domain    | `src/domain/licenses.ts`, `src/domain/options.ts`           | License normaliser, unversioned licenses               |
| Sources   | `src/lib/photoSources/*`, `src/lib/photos.ts`               | Clients, storing, selecting, rejecting                 |
| Jobs      | `src/jobs/fetchPhotoCandidates.ts`, `src/payload.config.ts` | Tasks, workflow, job access (admins or cron)           |
| Endpoints | `src/endpoints/photoActions.ts`, collections                | Fetch, select, reject                                  |
| Admin     | `src/components/admin/*`                                    | Review queue, grid, buttons, nav link, species actions |
| Ops       | `vercel.json`, `.env.example`, REST route                   | Daily cron, S3 and cron variables, `maxDuration`       |
| Database  | `src/migrations/*_photo_pipeline.*`                         | Jobs tables, license values                            |

## Tests

| Acceptance criterion                                       | Test                                     |
| ---------------------------------------------------------- | ---------------------------------------- |
| Parsing, licenses, allowlist, de-duplication               | `tests/unit/photoSources.test.ts`        |
| Workflow run twice, select downloads, unknown host refused | `tests/int/photoPipeline.int.test.ts`    |
| Review queue reject with X                                 | `tests/e2e/reviewQueue.e2e.ts` (desktop) |

## Risks and spec updates

- `architecture.md` §3: unversioned `CC-BY` / `CC-BY-SA`, and candidates may carry a suggested slot.
- Real API responses were not called from the build environment. The parsers follow the documented response shapes and are covered by fixtures; the first real run should be watched in the admin.
- Production needs `S3_*` variables (Vercel's filesystem is read-only) and `CRON_SECRET`.
