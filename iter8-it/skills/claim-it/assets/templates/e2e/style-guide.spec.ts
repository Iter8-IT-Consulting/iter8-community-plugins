import { expect, test } from "@playwright/test";
import { site } from "../src/app/site";

test("the style guide shows the app's colors and pieces", async ({ page }) => {
  await page.goto("/style-guide");
  await expect(page.getByRole("heading", { level: 1, name: `${site.name} style guide` })).toBeVisible();
  await expect(page.getByText("--brand-primary")).toBeVisible();
  // Token values are read from the live CSS, so they must be filled in.
  await expect(page.getByText(/^#[0-9a-f]{6}$/i).first()).toBeVisible();
});
