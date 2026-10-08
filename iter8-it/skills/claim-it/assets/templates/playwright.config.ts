import { defineConfig, devices } from "@playwright/test";

// The tests run against a production build of the app (`next build` +
// `next start`), on its own port, locally and in CI alike: the same thing
// people get, without the dev server's compile-on-first-visit delays that
// make tests slow and flaky. It never reuses a server that's already
// running (that could be another app, or `npm run dev`).
//
// Set BASE_URL to test a deployed site instead (for example the live
// production URL). Set E2E_PORT if 3100 is taken.
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // In CI a test that only passes on a retry fails the run: flaky tests get
  // fixed instead of quietly retried.
  failOnFlakyTests: isCI,
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
        command: `npm run build && npm run start -- --port ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 300_000,
      },
});
