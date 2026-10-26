# Product spec

Status: agreed for v1, 2026-10-26.

## 1. Summary

Treefinder is a free web app, designed mobile first, that gives wood carvers a carving card for each tree species, plus reference photos and a filter key to identify the tree themselves. V1 launches in Danish with 15 checked carving species and 3 warning species.

## 2. Audience and goals

- **Audience:** beginner and intermediate carvers in Northern and Western Europe.
- **Launch:** Danish Facebook carving groups first, then r/Spooncarving and r/woodcarving once the English version is ready. Read each group's self-promotion rules before posting.
- **Purpose:** a free community tool and a portfolio piece. Not a business for now, but nothing in v1 should rule out charging later (see the media licensing rule in the constitution).
- **Learning goals for the maintainer:** Payload CMS, a data pipeline built on third-party APIs (Wikimedia Commons, iNaturalist, Claude), and testing and CI with one PR per feature.

## 3. Scope

**In v1**

- Species list and carving cards
- Reference photos and a filter key for identifying trees yourself
- A "where to get wood" page
- Admin dashboard with photo and drafting pipelines and a review queue
- Danish UI and content, with translation set up for English

**Not in v1:** accounts, favorites, AI photo identification, the guessing game, North American species, user submissions. See section 9.

**Launch bar:** 15 carving species plus 3 warning species, all published through the review workflow (see `species.md`).

## 4. Public site

Danish lives at the root, English under `/en` with translated paths. English stays hidden until its cards are translated.

| Page | Danish path | English path | What it does |
| --- | --- | --- | --- |
| Home | `/` | `/en` | Search by any name, a link to the filter key, and an intro |
| All species | `/arter` | `/en/species` | Searchable list with photo thumbnails, filtered by carving use and difficulty |
| Species card | `/arter/[slug]` | `/en/species/[slug]` | Carving card and reference photos |
| Filter key | `/find-traeet` | `/en/identify` | Pick traits, see matching species |
| Where to get wood | `/skaf-trae` | `/en/get-wood` | Arborists, storm-felled trees, garden pruning, sankekort, selvskovning |
| About | `/om` | `/en/about` | About the project, food safety disclaimer, image credits |

**Acceptance criteria**

- [ ] Searching for the Latin name or any local name finds the species ("lind", "linden" and "Tilia cordata" all find small-leaved lime).
- [ ] Only published species appear on the public site.
- [ ] Every page works at 360 px width without horizontal scrolling.
- [ ] `/admin` is excluded from search engines.
- [ ] `/en` routes return 404 until English is enabled.

## 5. Carving card

Every species card has the same fields, in this order. "Localized" means translated per language.

| Field | Type | Notes |
| --- | --- | --- |
| Names | Latin name + local names (da, sv, nb, de, nl, en) | Not localized. All names are searchable. |
| Warning species | Yes/no + a short reason (localized) | Shows a red banner at the top of the card |
| Carving green | Easy / medium / hard | Shown as a badge |
| Hardness when dry | Soft / medium / hard + Janka value in N when known | Badge plus the number |
| Grain and texture | Rich text, localized | |
| Colour and smell when freshly cut | Rich text, localized | Useful for identifying cut wood |
| Good for | Tags (spoons, bowls, kuksa, figures, handles, spatulas, boxes) + rich text | Tags drive the filter on the species list |
| Riving and splitting | Rich text, localized | |
| Drying | Rich text, localized | |
| Food safety and toxicity | Rich text, localized + a "checked against a source" tick | Always shown with the disclaimer |
| Identification features | Leaf, bark, winter twig and bud, overall shape, cut wood (rich text each) | Shown next to the matching photo slot |
| Often confused with | Links to other species | Shown as cards with a thumbnail |
| Sources | List of title, URL and the field it supports | Hidden behind a "Kilder" (Sources) button |

**Disclaimer (draft wording, to be finalized):**

> Oplysningerne er vejledende og erstatter ikke din egen vurdering. Er du i tvivl om, hvorvidt et træ er sikkert til madredskaber, så lad være med at bruge det.

(English: the information is guidance only and doesn't replace your own judgement. If you're unsure whether a wood is safe for food utensils, don't use it.)

**Acceptance criteria**

- [ ] The disclaimer is shown directly under the food safety section on every card, and on the About page.
- [ ] Warning species show a warning banner above everything else on the card.
- [ ] The sources list is collapsed by default. When opened, sources are grouped by the field they support.
- [ ] Every photo shows author, license and a source link.

## 6. Self-identification

Users identify a tree by comparing reference photos and narrowing the list with a filter key. There is no AI in v1.

### 6.1 Photo slots per species

| Slot | Required | Purpose |
| --- | --- | --- |
| Whole tree | Yes | Shape and size from a distance |
| Leaf (or needles) | Yes | The easiest feature in summer |
| Bark, mature | Yes | Identification in winter and on logs |
| Winter twig and bud | Yes | Identification without leaves |
| Cut wood or end grain | No | What carvers actually hold |

### 6.2 Filter key (MVP, to be evaluated)

Six traits, each shown as tappable chips with a small line icon. Every trait starts as "ved ikke" (don't know). The result list updates live, with a count.

| Trait | Values |
| --- | --- |
| Leaf type | Needles, scales, broad leaves |
| Leaf or bud arrangement | Opposite, alternate |
| Leaf shape | Simple, lobed, pinnate (compound), palmate (compound) |
| Leaf edge | Smooth, toothed, double-toothed, spiny |
| Bark | Smooth, peeling or papery, furrowed or cracked, smooth with horizontal bands (lenticels) |
| Thorns on twigs | Yes, no |

- **Matching:** within a trait, any selected value matches. Across traits, every answered trait must match. Unanswered traits are ignored. A species can have several values per trait, for example young and old bark.
- **Winter:** leaf arrangement doubles as bud arrangement, and bark and thorns still work without leaves. The UI hints at this.
- **Results:** a thumbnail, the name, and the one or two traits that set it apart from the other results.

**Acceptance criteria**

- [ ] The matching rules above are covered by unit tests.
- [ ] With leaf type, arrangement and shape answered, every launch species ends up in a result list of 5 or fewer (a Vitest check against the seed data). If it doesn't, refine the traits before launch.
- [ ] Clearing all traits shows all published species.

## 7. Admin and review workflow

The maintainer is the only admin. Each species page in the admin has two buttons, **Fetch photo candidates** and **Draft card**. They queue background jobs, and everything they produce lands in one review queue.

### 7.1 Card states

1. **AI draft:** written by the drafting job
2. **Needs changes:** the admin has left review notes. Edit it by hand or re-draft.
3. **Approved:** content checked, but not public yet
4. **Published:** live on the site

### 7.2 Photo states

Candidate, then selected (into a slot) or rejected. Each species can have only one selected photo per slot.

### 7.3 Publish rules

A species can only move to Published when:

- [ ] the food safety tick is set
- [ ] all four required photo slots have a selected photo
- [ ] it has at least one source
- [ ] all required Danish fields are filled in
- [ ] warning species have a warning reason

Each rule is enforced server-side and has a unit test.

### 7.4 Jobs

- **Fetch photo candidates:** pulls about 20 candidates per species from Wikimedia Commons and iNaturalist (research grade). Keeps only CC0, CC-BY and CC-BY-SA, and skips duplicates. A photo is copied into storage only when it's selected.
- **Draft card:** asks Claude, with web search, to write the card fields in Danish, with sources per field. It only runs on cards in AI draft or Needs changes. Version history keeps the previous text.

### 7.5 Review queue

- Cards waiting for review, oldest first.
- Photo candidates grouped by species in a grid. Tap a photo, then a slot. Keyboard shortcuts on desktop: 1 to 5 to pick a slot, X to reject.
- Built so user submissions can later arrive as another source of candidates.

**Acceptance criteria**

- [ ] A Playwright test takes one species from AI draft to Published through the admin UI.
- [ ] Rejected candidates never appear on the public site.
- [ ] Public sign-up to the admin is impossible.

## 8. Where to get wood

A static page (a Payload global, localized) explaining the legal routes in Denmark: arborists, storm-felled trees, garden pruning, Naturstyrelsen's sankekort and selvskovning, and that collecting is often limited to the winter half of the year. It does not tell anyone to cut trees.

## 9. Later, not v1

- **Accounts and favorites, together:** a separate public user collection, so a visitor can never become an admin.
- **User photo submissions:** these go into the existing review queue.
- **Guessing game:** uses only selected, labelled photos, never unverified uploads.
- **AI photo identification:** only if a test on 10 photos of logs and bare branches gets most of them right. Pl@ntNet commercial use starts at €1,000 a year.
- **North American species:** if Reddit asks for them.
- **Dropped:** a map of nearby trees. Data coverage is too patchy outside cities.

## 10. Open items

- Final app name and domain (before launch)
- Final Danish wording of the disclaimer
- Final species list (see `species.md`)

## Sources

- [Bolius: sankekort and selvskovning](https://www.bolius.dk/sank-selv-saadan-faar-du-det-billigste-braende-24311)
- [Naturstyrelsen: firewood and sankekort, Hovedstaden](https://naturstyrelsen.dk/drift-og-pleje/salg-og-udleje/braende-og-sankekort/hovedstaden/)
- [Pl@ntNet API pricing](https://my.plantnet.org/pricing)
- [iNaturalist: licenses](https://help.inaturalist.org/en/support/solutions/articles/151000175695)
