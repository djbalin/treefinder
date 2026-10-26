import { expect, test } from "@playwright/test";
import { admin, fixtures } from "./fixtures";

test.describe("review queue", () => {
  // The admin is a desktop tool, and the test changes shared fixture data,
  // so it runs once, on the desktop project.
  test.skip(({ isMobile }) => isMobile, "Desktop admin only");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#field-email", admin.email);
    await page.fill("#field-password", admin.password);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/admin$/);
  });

  test("lists candidates and rejects one with the X key", async ({ page }) => {
    await page.goto("/admin/review");
    await expect(
      page.getByRole("heading", { name: "Gennemgang", level: 1 }),
    ).toBeVisible();

    const candidate = page.getByRole("article", {
      name: new RegExp(fixtures.candidateAttribution),
    });
    await expect(candidate).toBeVisible();

    await candidate.focus();
    await page.keyboard.press("x");

    await expect(page.getByText("Foto afvist.")).toBeVisible();
    await expect(candidate).toHaveCount(0);
  });
});
