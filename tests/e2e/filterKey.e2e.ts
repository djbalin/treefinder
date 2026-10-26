import { expect, test } from "@playwright/test";
import { fixtures } from "./fixtures";

test.describe("filter key", () => {
  test("narrows the list as traits are picked, and resets", async ({
    page,
  }) => {
    await page.goto("/find-traeet");

    const results = page.getByRole("region", { name: /passer/ });
    await expect(
      results.getByRole("link", { name: fixtures.lime.name }),
    ).toBeVisible();
    await expect(
      results.getByRole("link", { name: fixtures.yew.name }),
    ).toBeVisible();

    await page.getByText("Nåle", { exact: true }).click();
    await expect(
      results.getByRole("link", { name: fixtures.yew.name }),
    ).toBeVisible();
    await expect(
      results.getByRole("link", { name: fixtures.lime.name }),
    ).toHaveCount(0);
    await expect(page).toHaveURL(/leafType=needles/);

    // Within a trait any picked value matches.
    await page.getByText("Løvblade", { exact: true }).click();
    await expect(
      results.getByRole("link", { name: fixtures.lime.name }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Nulstil" }).click();
    await expect(page).not.toHaveURL(/leafType/);
    await expect(
      results.getByRole("link", { name: fixtures.lime.name }),
    ).toBeVisible();
  });

  test("reads the selection from the URL", async ({ page }) => {
    await page.goto("/find-traeet?bark=peeling");
    const results = page.getByRole("region", { name: /passer/ });
    await expect(
      results.getByRole("link", { name: fixtures.yew.name }),
    ).toBeVisible();
    await expect(
      results.getByRole("link", { name: fixtures.lime.name }),
    ).toHaveCount(0);
  });
});
