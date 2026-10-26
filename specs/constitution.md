# Constitution

These rules override convenience. Changing one takes an explicit PR that edits this file.

## Product

1. **The carving cards are the product.** Identification exists to lead users to a card. Generic tree-ID apps already exist, and practical carving knowledge per species is what's missing.
2. **No unchecked claims.** Every card claim has a source. A card cannot be published until a human has checked its food safety and toxicity section against a source.
3. **Safety first.** Food safety and toxicity information is always shown with the disclaimer. Toxic species get a visible warning.
4. **Commercially safe media only.** Only CC0, CC-BY and CC-BY-SA images, each shown with author, license and source. Never NC or all-rights-reserved images.
5. **Legality is the user's responsibility,** but the app explains the legal ways to get wood.
6. **Danish first.** Danish is the default and required locale. Other languages are optional per field.
7. **No visitor accounts and no visitor data in v1.** Only the admin signs in. Analytics must be cookie-free.

## Engineering

1. **Specs before code.** See `specs/README.md`.
2. **One PR per feature,** with green CI. No direct commits to `main`.
3. **Every acceptance criterion has a test.** Unit tests (Vitest) for logic, Playwright for user flows.
4. **Content lives in Convex,** not in code. UI strings live in next-intl message files.
5. **Secrets only in environment variables.** No debug output or stray artifacts on `main`.
6. **Respect external APIs:** a descriptive User-Agent for Wikimedia, about 1 request per second for iNaturalist, and a spend limit on the Claude API key.
