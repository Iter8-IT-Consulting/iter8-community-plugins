import { expect, test } from "@playwright/test";

// Page changes after signing in can be slow on a busy machine.
const navigation = { timeout: 15_000 };

// Signing up needs a database. Locally and in CI that's the local
// Supabase, where email confirmation is off. Tagged @writes: it creates an
// account, so Ship It skips it when checking the live site.
test("someone can create an account, sign out, and sign back in @writes", async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = "correct-horse-battery";

  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in/, navigation);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/account$/, navigation);
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/, navigation);

  await page.goto("/sign-in?next=/account");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("status")).toContainText("don't match", navigation);

  // The form comes back empty after a failed attempt.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account$/, navigation);
});
