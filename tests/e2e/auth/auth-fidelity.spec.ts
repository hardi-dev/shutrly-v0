import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const EXPORTS = "docs/features/auth/exports";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const PAIRS = [
  { route: "/login", desktop: "login-amp4Y", mobile: "login-IOC5i" },
  { route: "/register", desktop: "register-m3QGM", mobile: "register-UryLp" },
  { route: "/forgot-password", desktop: "forgot-password-o9WtCo", mobile: "forgot-password-e091S" },
  { route: "/forgot-password?state=sent", desktop: "reset-sent-DccPx", mobile: "reset-sent-NkvJG" },
  {
    route: "/reset-password",
    desktop: "invalid-reset-link-x5ds7",
    mobile: "invalid-reset-link-Hf3VK",
  },
  {
    route: "/account-unavailable",
    desktop: "account-unavailable-kXr5x",
    mobile: "account-unavailable-FFue5",
  },
] as const;

for (const pair of PAIRS) {
  for (const [viewport, name] of [
    [DESKTOP, pair.desktop],
    [MOBILE, pair.mobile],
  ] as const) {
    test(`design fidelity ${name} matches ${pair.route}`, async ({ page }, testInfo) => {
      const file = resolve(EXPORTS, `${name}.html`);
      expect(existsSync(file), `${name}.html is missing from ${EXPORTS}`).toBe(true);
      await page.setViewportSize(viewport);
      await page.goto(pathToFileURL(file).href);
      const snapshot = `${name}.png`;
      await page.screenshot({ path: testInfo.snapshotPath(snapshot), fullPage: true });
      await page.goto(pair.route);
      await expect(page).toHaveScreenshot(snapshot, { fullPage: true, maxDiffPixelRatio: 0.01 });
    });
  }
}
