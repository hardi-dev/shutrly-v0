import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";
import { parse } from "dotenv";

const baseURL = "http://localhost:3000";
// E2E_PROD=1 runs the specs against `pnpm build && pnpm start` on the same port (I8.1 build smoke).
// `next start` does not read .dev.vars, and the production build answers landing-only without
// APP_STAGE, so that file's bindings go into the server's environment. Better Auth's URL in
// .dev.vars is this same port, so sessions stay valid.
const PROD = process.env.E2E_PROD === "1";
const SMOKE_KEY = "GALLERY_SMOKE_FOLDER_URL";

function devVars(): Record<string, string> {
  return existsSync(".dev.vars") ? parse(readFileSync(".dev.vars")) : {};
}

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

/**
 * IPv4-only DNS for the server Playwright starts (scripts/dev/ipv4-only.cjs): without a working
 * IPv6 route, Node sometimes reaches Neon over IPv6, the websocket times out and pages fail at
 * random. Local tooling only.
 */
const IPV4_ONLY = {
  NODE_OPTIONS: `--require ${path.resolve("scripts/dev/ipv4-only.cjs")}`,
};

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
  webServer: PROD
    ? {
        command: "pnpm build && pnpm start -p 3000",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 900_000,
        env: { ...devVars(), ...IPV4_ONLY },
      }
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: IPV4_ONLY,
      },
});
