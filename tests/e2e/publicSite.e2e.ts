import { expect, type Page, test } from "@playwright/test";
import { fixtures } from "./fixtures";

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("species list", () => {
  test("lists published species only", async ({ page }) => {
    await page.goto("/arter");

    await expect(
      page.getByRole("link", { name: fixtures.lime.name }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: fixtures.yew.name }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: fixtures.draft.name }),
    ).toHaveCount(0);
    await expectNoHorizontalScroll(page);
  });

  for (const query of ["lind", "linden", "Tilia cordata"]) {
    test(`search for "${query}" finds small-leaved lime`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("searchbox").fill(query);
      await page.getByRole("button", { name: "Søg" }).click();

      await expect(page).toHaveURL(/\/arter\?q=/);
      await expect(
        page.getByRole("link", { name: fixtures.lime.name }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: fixtures.yew.name }),
      ).toHaveCount(0);
    });
  }
});

test.describe("species card", () => {
  test("shows the card fields, disclaimer, photos and credits", async ({
    page,
  }) => {
    await page.goto(`/arter/${fixtures.lime.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      fixtures.lime.name,
    );
    await expect(page.getByText("Snitning, grønt træ")).toBeVisible();
    await expect(page.getByText("Janka 2600 N")).toBeVisible();

    const foodSafety = page.getByRole("region", {
      name: "Fødevaresikkerhed og giftighed",
    });
    await expect(
      foodSafety.getByText(/erstatter ikke din egen vurdering/),
    ).toBeVisible();

    await expect(page.getByText("Foto: Test Fotograf, bark")).toBeVisible();
    await expect(
      page.getByRole("link", { name: fixtures.yew.name }),
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("keeps sources collapsed until opened, grouped by field", async ({
    page,
  }) => {
    await page.goto(`/arter/${fixtures.lime.slug}`);

    const sourceLink = page.getByRole("link", {
      name: "Kilde om fødevaresikkerhed",
    });
    await expect(sourceLink).toBeHidden();

    await page.getByText("Kilder (2)").click();
    await expect(sourceLink).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fødevaresikkerhed", level: 3 }),
    ).toBeVisible();
  });

  test("shows the warning banner above everything on warning species", async ({
    page,
  }) => {
    await page.goto(`/arter/${fixtures.yew.slug}`);

    const banner = page.getByRole("region", { name: "Advarsel" });
    await expect(banner).toContainText("Alle dele af taks er giftige.");

    const bannerBox = await banner.boundingBox();
    const headingBox = await page
      .getByRole("heading", { level: 1 })
      .boundingBox();
    expect(bannerBox?.y).toBeLessThan(headingBox?.y ?? 0);
  });

  test("returns 404 for unpublished species", async ({ page }) => {
    const response = await page.goto(`/arter/${fixtures.draft.slug}`);
    expect(response?.status()).toBe(404);
  });
});

test.describe("static pages", () => {
  test("where to get wood renders its page", async ({ page }) => {
    await page.goto("/skaf-trae");
    await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
  });

  test("about shows the disclaimer and image credits", async ({ page }) => {
    await page.goto("/om");
    await expect(
      page.getByText(/erstatter ikke din egen vurdering/),
    ).toBeVisible();
    await expect(page.getByText(/Test Fotograf, leaf/).first()).toBeVisible();
  });
});
