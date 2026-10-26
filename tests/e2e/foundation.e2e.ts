import { expect, test } from "@playwright/test";

test("home page renders in Danish", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Find det rigtige træ at snitte i",
  );
});

test("English is not served while disabled", async ({ page }) => {
  const response = await page.goto("/en");

  expect(response?.status()).toBe(404);
});

test("unknown pages return the Danish not-found page", async ({ page }) => {
  const response = await page.goto("/findes-ikke");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Siden findes ikke",
  );
});

test("admin shows the Payload login", async ({ page }) => {
  await page.goto("/admin");

  // With no admin yet, Payload shows its first-user screen instead.
  await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/);
  await expect(page.locator("input[name='email']")).toBeVisible();
});
