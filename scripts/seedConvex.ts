/**
 * Seeds the Convex deployment in .env.local (or CONVEX_DEPLOYMENT) with the
 * species list from specs/species.md and the static pages. Idempotent.
 *
 *   pnpm seed:convex
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const speciesMarkdown = readFileSync(
  path.join(root, "specs/species.md"),
  "utf8",
);

execFileSync(
  "npx",
  ["convex", "run", "seed:run", JSON.stringify({ speciesMarkdown })],
  { cwd: root, stdio: "inherit" },
);
