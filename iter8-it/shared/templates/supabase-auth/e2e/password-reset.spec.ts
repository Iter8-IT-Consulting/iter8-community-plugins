import { expect, test } from "@playwright/test";
import fs from "node:fs";

// Forgot password, end to end, against the local Supabase: the reset email
// is read from the local mail viewer (Mailpit). Locally and in CI only;
// tagged @writes, so Ship It skips it on the live site.

const navigation = { timeout: 15_000 };

// Mailpit's address: MAILPIT_URL (set in CI), or from .env.local (written by
// iter8-it's supabase-env.mjs).
function mailpitUrl(): string {
  if (process.env.MAILPIT_URL) return process.env.MAILPIT_URL;
  const env = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
  const match = env.match(/^MAILPIT_URL=(.+)$/m);
  if (!match) throw new Error("MAILPIT_URL isn't set. Run iter8-it's supabase-env.mjs to write .env.local.");
  return match[1].trim().replace(/^"|"$/g, "");
}

async function resetLinkFor(email: string): Promise<string> {
  const mailpit = mailpitUrl();
  for (let attempt = 0; attempt < 20; attempt++) {
    const search = await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    const { messages } = (await search.json()) as { messages: { ID: string }[] };
    if (messages?.length) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${messages[0].ID}`)).json()) as { Text: string };
      const link = message.Text.match(/https?:\/\/\S+/)?.[0];
      if (link) return link.replace(/&amp;/g, "&");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No reset email arrived for ${email}`);
}

test("someone who forgot their password can choose a new one @writes", async ({ page }) => {
  const email = `reset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  // An account to forget the password of.
  await page.goto("/sign-in?next=/account");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("first-password-123");
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/account/, navigation);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/, navigation);

  // Forgot it.
  await page.goto("/sign-in");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send me a link" }).click();
  await expect(page.getByRole("status")).toContainText("on its way", navigation);

  // The link in the email signs them in and asks for a new password.
  await page.goto(await resetLinkFor(email));
  await expect(page).toHaveURL(/\/reset-password/, navigation);
  await page.getByLabel("New password").fill("second-password-456");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("status")).toContainText("password has been changed", navigation);

  // The new password works.
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/sign-in?next=/account");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("second-password-456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account/, navigation);
});
