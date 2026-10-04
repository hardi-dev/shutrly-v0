import { existsSync, readFileSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";
import { parse } from "dotenv";

const baseURL = "http://localhost:3000";
const SMOKE_KEY = "GALLERY_SMOKE_FOLDER_URL";

/**
 * Takes only the smoke folder from `.env.test`: the rest of that file (database, `APP_STAGE=test`)
 * must not leak into the dev server Playwright starts. A value already in the shell wins.
 */
function loadSmokeFolderUrl(): void {
  if (process.env[SMOKE_KEY] || !existsSync(".env.test")) return;
  const value = parse(readFileSync(".env.test"))[SMOKE_KEY];
  if (value) process.env[SMOKE_KEY] = value;
}

loadSmokeFolderUrl();

export default defineConfig({
  testDir: "tests/e2e",
  // The real-Drive smoke test needs a public folder (F-09 Slice 8).
  testIgnore: process.env[SMOKE_KEY] ? [] : ["**/*-drive-smoke.spec.ts"],
  fullyParallel: false,
  // Better Auth's scrypt work is CPU-bound; parallel auth journeys cause false timeout failures.
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm dev", url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
