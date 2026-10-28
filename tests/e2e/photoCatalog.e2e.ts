import { expect, test } from "@playwright/test";
import { fixtures, signInAsAdmin } from "./fixtures";

// Product spec 7.5: curating a slot's gallery in the photo catalog with the
// keyboard. Desktop only, since it changes shared fixture data.
test.skip(({ isMobile }) => isMobile, "Desktop admin only");

test("selects, stars and rejects bark photos with the keyboard", async ({
  page,
}) => {
  await signInAsAdmin(page);
  await page.getByRole("link", { name: fixtures.lime.name }).click();
  await page.getByRole("link", { name: /Åbn fotokatalog/ }).click();
  await page
    .getByRole("navigation", { name: "Fotokatalog" })
    .getByRole("link", { name: /^Bark/ })
    .click();
  await expect(page).toHaveURL(/plads=bark/);

  await page.getByRole("article", { name: /^E2E katalog 1$/ }).focus();
  await page.keyboard.press(" ");
  const selected = page.getByRole("article", {
    name: /^E2E katalog 1, Galleri$/,
  });
  await expect(selected).toBeVisible();

  await selected.focus();
  await page.keyboard.press("p");
  await expect(
    page.getByRole("article", { name: /^E2E katalog 1, Galleri, Plakat$/ }),
  ).toBeVisible();

  const second = page.getByRole("article", { name: /^E2E katalog 2$/ });
  await second.focus();
  await page.keyboard.press("x");
  await expect(second).toHaveCount(0);
});
