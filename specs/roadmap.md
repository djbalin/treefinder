# Roadmap

One PR per milestone, in this order. Before starting a milestone, create its feature folder from `_template/` and link it here.

| # | Milestone | Scope | Feature spec | Status |
| --- | --- | --- | --- | --- |
| 0 | Specs | Constitution, product and architecture specs, species draft, agent instructions | This folder | In review |
| 1 | Foundation | Next.js 16 + Payload 3 scaffold, Supabase Postgres and Storage, Biome, next-intl (Danish default), Vitest and Playwright skeletons, GitHub Actions, Vercel previews, README, `.env.example` | | Not started |
| 2 | Verify job runtime | Measure a realistic Claude call with web search against Vercel's function time limits, before building on the jobs queue. Record the result in `architecture.md`. | | Not started |
| 3 | Data model | `species`, `photos`, `users`, globals, card states, publish rules with unit tests, seed script from `species.md` | | Not started |
| 4 | Public site | Species list, card page with sources button and disclaimer, where to get wood, about and credits, search across names | | Not started |
| 5 | Photo pipeline | `fetchPhotoCandidates` job (Commons and iNaturalist, license filter), photo half of the review queue | | Not started |
| 6 | Drafting pipeline | `draftCard` job (Claude API), card half of the review queue | | Not started |
| 7 | Filter key | Traits on `species`, filter page, acceptance check | | Not started |
| 8 | Launch content | 15 species and 3 warning species checked and published, analytics on, final name and domain. Post in the Danish groups. | | Not started |
| 9 | English | Translate published cards, enable `/en`, post on Reddit | | Not started |
