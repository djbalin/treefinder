import { expect, test } from "@playwright/test";
import { fixtures, signInAsAdmin } from "./fixtures";

// Product spec §7.5: one species goes from AI draft to Published through the
// admin UI. Desktop only, since it changes shared fixture data.
test.skip(({ isMobile }) => isMobile, "Desktop admin only");

test("an AI draft is published from the admin and appears on the site", async ({
  page,
}) => {
  await signInAsAdmin(page);

  // The draft waits in the review queue.
  await page.goto("/admin/gennemgang");
  await page
    .getByRole("region", { name: "Kort til gennemgang" })
    .getByRole("link", { name: fixtures.ready.name })
    .click();
  await page.waitForURL(/\/admin\/arter\/.+/);

  // Not public yet.
  const before = await page.request.get(`/arter/${fixtures.ready.slug}`);
  expect(before.status()).toBe(404);

  await expect(page.getByText("Kortet kan udgives.")).toBeVisible();
  await page.getByRole("button", { name: "Udgivet" }).click();
  await expect(page.getByText("Gemt.")).toBeVisible();

  const response = await page.goto(`/arter/${fixtures.ready.slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    fixtures.ready.name,
  );
});
