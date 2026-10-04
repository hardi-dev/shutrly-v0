import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  // The real-Drive smoke test needs a public folder (F-09 Slice 8).
  testIgnore: process.env.GALLERY_SMOKE_FOLDER_URL ? [] : ["**/*-drive-smoke.spec.ts"],
  fullyParallel: false,
  // Better Auth's scrypt work is CPU-bound; parallel auth journeys cause false timeout failures.
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm dev", url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
