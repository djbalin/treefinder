# 05. Photo pipeline: spec

Status: done
Milestone: 5 (see `specs/roadmap.md`)

## Problem

Every published card needs four reference photos under commercially safe licenses, with attribution. Finding and checking them by hand for 40 species is slow. The admin needs candidates fetched automatically and a fast way to pick or reject them (product spec §7.4 and §7.5).

## Requirements

1. A "Fetch photo candidates" action per species (on the species page and in the review queue) queues a job and runs it straight after the response (architecture §5, runtime model).
2. The job has one task per source:
   - Wikimedia Commons: the species category plus its "(bark)" and "(leaves)" subcategories, which suggest a slot.
   - iNaturalist: research-grade observations of the exact species taxon.
3. Only CC0, CC-BY and CC-BY-SA photos are kept (versioned or, for iNaturalist, unversioned). NC, ND, public-domain marks and unknown licenses are dropped.
4. Candidates are stored as links with author, license, attribution and source page. Running the job again does not duplicate them.
5. A review queue at `/admin/review`, linked from the admin navigation:
   - candidates grouped by species, with the slots already filled
   - a slot button per photo, or reject
   - keyboard: focus a photo, 1 to 5 picks a slot, X rejects
   - a table of all species with their photo coverage and a fetch button
6. Selecting a candidate downloads its file, only from known image hosts over https, and stores it (Supabase Storage via its S3 API in production, `./media` locally).
7. A daily Vercel Cron call runs any leftover jobs, authorized by `CRON_SECRET`.
8. Wikimedia gets a descriptive User-Agent; iNaturalist calls are spaced about a second apart.

## Acceptance criteria

- [x] License mapping, Commons and iNaturalist parsing, host allowlist and de-duplication have unit tests.
- [x] Running the workflow twice against fake APIs stores each candidate once (integration).
- [x] Selecting a candidate downloads and attaches its file; unknown hosts are refused (integration).
- [x] The review queue lists a candidate and X rejects it (end-to-end).

## Out of scope

- The card half of the review queue (milestone 6). User submissions (later).
