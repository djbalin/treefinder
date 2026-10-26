import { expect, test } from "@playwright/test";
import { fixtures, signInAsAdmin } from "./fixtures";

test.describe("review queue", () => {
  // The admin is a desktop tool, and the test changes shared fixture data,
  // so it runs once, on the desktop project.
  test.skip(({ isMobile }) => isMobile, "Desktop admin only");

  test("lists candidates and rejects one with the X key", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/admin/gennemgang");
    await expect(
      page.getByRole("heading", { name: "Gennemgang", level: 1 }),
    ).toBeVisible();

    const candidate = page.getByRole("article", {
      name: new RegExp(fixtures.candidateAttribution),
    });
    await expect(candidate).toBeVisible();

    await candidate.focus();
    await page.keyboard.press("x");

    await expect(page.getByText("Gemt.")).toBeVisible();
    await expect(candidate).toHaveCount(0);
  });
});
