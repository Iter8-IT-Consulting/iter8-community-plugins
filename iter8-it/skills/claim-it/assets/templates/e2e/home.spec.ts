import { expect, test } from "@playwright/test";
import { site } from "../src/app/site";

test("the home page shows the app's name and purpose", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: site.name })).toBeVisible();
  await expect(page.getByText(site.purpose)).toBeVisible();
  await expect(page).toHaveTitle(site.name);
});
