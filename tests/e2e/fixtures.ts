import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";

/*
 * Fixture species for the end-to-end tests live in Convex (convex/testing.ts).
 * Global setup replaces them through the Convex CLI, against the deployment
 * in .env.local (the local backend in CI), and removes them afterwards.
 */

/** Every fixture slug starts with this prefix so teardown can find it. */
export const PREFIX = "e2e-";

/** The placeholder admin login from the environment (admin/admin in dev). */
export const admin = {
  username: process.env.ADMIN_USERNAME ?? "admin",
  password: process.env.ADMIN_PASSWORD ?? "admin",
};

export async function signInAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Brugernavn").fill(admin.username);
  await page.getByLabel("Adgangskode").fill(admin.password);
  await page.getByRole("button", { name: "Log ind" }).click();
  await page.waitForURL(/\/admin$/);
}

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
