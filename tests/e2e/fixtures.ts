import { execFileSync } from "node:child_process";

/*
 * Fixture species for the end-to-end tests live in Convex (convex/testing.ts).
 * Global setup replaces them through the Convex CLI, against the deployment
 * in .env.local (the local backend in CI), and removes them afterwards.
 */

/** Every fixture slug starts with this prefix so teardown can find it. */
export const PREFIX = "e2e-";

export const admin = {
  email: "e2e-admin@example.com",
  password: "e2e-admin-password",
};

export const fixtures = {
  lime: { slug: `${PREFIX}lind`, name: "E2E lind" },
  yew: { slug: `${PREFIX}taks`, name: "E2E taks" },
  draft: { slug: `${PREFIX}kladde`, name: "E2E kladde" },
  candidateAttribution: "E2E kandidat",
  ready: { slug: `${PREFIX}klar`, name: "E2E klar" },
};

function convexRun(functionName: string) {
  execFileSync("npx", ["convex", "run", functionName], { stdio: "inherit" });
}

export default async function globalSetup() {
  convexRun("testing:seedFixtures");
  return async () => {
    convexRun("testing:clearFixtures");
  };
}
