# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + Payload CMS 3, Tailwind CSS 4, next-intl, Supabase, Vercel. See `specs/architecture.md`.

## Users

Beginner and intermediate wood carvers in Northern and Western Europe, launching in Denmark. They mostly use Treefinder at home, planning: browsing species cards on a sofa or at a desk, reading up on a wood before a trip outdoors or before a carve. Their job is to learn which trees are worth carving, what each wood is good for, how to dry it, whether it is food safe, and how to recognise the tree.

## Product Purpose

A free reference of carving cards, one per tree species: how the wood carves green and dry, what to make from it, riving, drying, food safety and toxicity. Each card has reference photos (whole tree, leaf, bark, winter twig, optional cut wood) and a filter key, so users can identify a tree themselves. Success means carvers in Danish carving groups use it and trust it.

## Positioning

Tree identification apps already exist and are free. Treefinder's claim is the carving knowledge per species, checked by a person, with a source for every claim. The cards are the product; identification only leads to a card.

## Operating Context

- Discovered through links shared in Danish Facebook carving groups, later r/Spooncarving and r/woodcarving.
- Used mostly for planning and reading at home, on phone or desktop. Mobile first, but long-form reading of a card is the main activity.
- Content is created by one admin in a Payload dashboard: AI drafts and photo candidates are reviewed before anything is published.

## Capabilities and Constraints

- V1: species list, carving cards, reference photos, a six-trait filter key, a "where to get wood" page, an about page. No accounts, no favorites, no AI identification.
- Danish is the default and required language. English comes later under `/en`.
- Images are CC0, CC-BY or CC-BY-SA only, each shown with author, license and source.
- Food safety and toxicity information is always shown with a disclaimer. Toxic species (yew, laburnum, spindle) get a warning card.
- Sources sit behind a "Kilder" button on each card.
- The final product name and domain are undecided. "Treefinder" is a working name.

## Brand Commitments

- **Voice:** an experienced friend. Informal Danish "du", practical and plain, like a seasoned carver showing you the ropes. No hype.
- **Anti-references:** corporate SaaS (bland cards, blue buttons, stock UI kit), and over-designed or artsy styling that gets in the way of reading a card on a phone.

## Evidence on Hand

No real content yet. Card text will come from AI drafts checked by the admin. Photos will come from Wikimedia Commons and iNaturalist under the license rules above. There are no testimonials, user counts or partners, and none may be invented.

## Product Principles

1. The carving knowledge is the product. Everything else serves getting a carver to the right card.
2. Trust comes from checked claims and visible sources, not from tone.
3. Safety information is never hidden or softened.
4. Readable first: a card must work as a calm read on a phone.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Readable at 360 px width. Content in Danish first.
