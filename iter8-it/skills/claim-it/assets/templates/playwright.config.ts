import { defineConfig, devices } from "@playwright/test";

// Set BASE_URL to run the tests against a deployed site (for example the
// live production URL) instead of starting the app locally. Set E2E_PORT to
// test on a different port when 3000 is busy (another app's dev server).
const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // One project per kind of device the app's people use. Meet It adjusts
  // these once the personas are known. Both use Chromium, so CI only needs
  // to install one browser.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: isCI ? `npm run build && npm run start -- --port ${port}` : `npm run dev -- --port ${port}`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
