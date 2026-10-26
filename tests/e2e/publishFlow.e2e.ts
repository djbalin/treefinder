import { expect, test } from "@playwright/test";
import { admin, fixtures } from "./fixtures";

// Product spec §7.5: one species goes from AI draft to Published through the
// admin UI. Desktop only, since it changes shared fixture data.
test.skip(({ isMobile }) => isMobile, "Desktop admin only");

test("an AI draft is published from the admin and appears on the site", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.fill("#field-email", admin.email);
  await page.fill("#field-password", admin.password);
  await page.click("button[type='submit']");
  await page.waitForURL(/\/admin$/);

  // The draft waits in the review queue.
  await page.goto("/admin/review");
  const cardsSection = page
    .locator("ul")
    .filter({ hasText: fixtures.ready.name })
    .first();
  await cardsSection.getByRole("link", { name: fixtures.ready.name }).click();
  await page.waitForURL(/\/admin\/collections\/species\/\d+/);

  // Not public yet.
  const before = await page.request.get(`/arter/${fixtures.ready.slug}`);
  expect(before.status()).toBe(404);

  await page.locator("#field-status").click();
  await page.getByRole("option", { name: /Udgivet|Published/ }).click();
  await page
    .getByRole("button", { name: /^(Gem|Save)$/ })
    .first()
    .click();
  await expect(
    page.getByText(/opdateret|updated successfully/i).first(),
  ).toBeVisible();

  const response = await page.goto(`/arter/${fixtures.ready.slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    fixtures.ready.name,
  );
});
