# P. Photo catalog: spec

Status: agreed
Milestone: see `specs/roadmap.md`

## Problem

A card shows one photo per slot. Recognising a tree needs more: several photos of the whole tree, the bark and the leaves, taken in different places and seasons. Commons and iNaturalist hold hundreds of usable photos for common species, but they are unsorted and sometimes mislabelled, so the maintainer curates them by hand. That only works with an admin tool built for picking many photos quickly.

## Requirements

1. Each slot holds a gallery of selected photos and at most one poster (product spec 6.1, 7.2). Galleries have no fixed size.
2. The catalog fetch gets 20 candidates per slot for whole tree, bark and leaf from the source in product spec 7.4, and "fetch 20 more" continues per slot. Bark comes only from the Commons bark category.
3. Publishing needs a poster in every required slot (product spec 7.3).
4. A catalog page per species in the admin: a tab per slot, toggle into the gallery, star the poster, move to another slot, reject, fetch 20 more, with keyboard shortcuts (product spec 7.5).
5. The card shows each slot's gallery, poster first, with every photo's credit. The home page and the plate on the card use the posters.
6. Selected photos are copied into Convex storage; candidates stay remote until selected.
7. The existing mock photos are not carried over: the maintainer curates every photo. Dev data is reset, and the mock trees go back to approved until they have posters.
8. The first fetch covers ten species: Småbladet lind, Vortebirk, Rødel, Æble, Hassel, Almindelig røn, Fuglekirsebær, Taks, Ær and Bøg.

## Acceptance criteria

- [ ] Making a photo the poster clears the slot's other poster (Convex test).
- [ ] Selecting a photo keeps the other selected photos in the slot (Convex test).
- [ ] Publishing without a poster in a required slot fails (Convex test).
- [ ] The catalog source is chosen per slot as in product spec 7.4, and a Commons continuation token is followed (unit test).
- [ ] The catalog page selects, stars and rejects with the keyboard (end-to-end).
- [ ] The card shows a slot's gallery with credits (end-to-end).

## Out of scope

- Automatic sorting of photos by what they show.
- User photo submissions.
