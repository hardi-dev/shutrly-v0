import { expect, type Page, test } from "@playwright/test";
import { copyMessages } from "@tests/support/copy/copy-messages";

import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import type { AppLocale } from "@/shared/locale/locale.types";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";
import { FOLDER_URL, publishedGallery } from "../client-access/client-access-e2e";

// I8.1 build smoke. Run against a production build with `E2E_PROD=1` (see playwright.config.ts).

// The device locale cookie (DEVICE_LOCALE_COOKIE in the composition layer).
const DEVICE_LOCALE_COOKIE = "shutrly_locale";
const LOCALES: readonly AppLocale[] = ["en", "id"];

// Routes that render without any data setup.
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/account-unavailable",
];

// Owner routes with no record ids in the path, for one signed-in owner.
const OWNER_ROUTES = [
  "/onboarding/workspace",
  "/profile",
  "/w/:id",
  "/w/:id/clients",
  "/w/:id/clients/archived",
  "/w/:id/projects",
  "/w/:id/projects/new",
  "/w/:id/projects/completed",
  "/w/:id/projects/cancelled",
  "/w/:id/services",
  "/w/:id/services/items",
  "/w/:id/services/categories",
  "/w/:id/team",
  "/w/:id/team/roles",
  "/w/:id/team/archived",
  "/w/:id/message-templates",
  "/w/:id/photo-sources",
  "/w/:id/settings",
];

// Hydration and render problems the console or the page reports. A missing message is one too.
const PROBLEM =
  /hydrat|minified react error|react error|missing message|\[next-intl\]|NextIntlClientProvider/i;

/** Collects every hydration, React, next-intl or uncaught page error seen by one page. */
function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    const level = message.type();
    if ((level === "error" || level === "warning") && PROBLEM.test(message.text())) {
      problems.push(`console ${level}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/**
 * True when a heading's text is one locale's copy: it equals a copy string, or contains a long one.
 * The landing headline rotates words in separate spans, so its text is a join of several strings.
 */
function isLocalizedHeading(text: string, locale: AppLocale): boolean {
  const copy: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === "string") copy.push(value.trim());
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(copyMessages(locale));
  const normalized = text.replaceAll(/\s+/g, " ").trim();
  return copy.some(
    (candidate) =>
      candidate === normalized || (candidate.length >= 8 && normalized.includes(candidate)),
  );
}

/** Opens one route and checks lang, a visible localized h1 and that no problem was reported. */
async function expectRouteRenders(
  page: Page,
  path: string,
  locale: AppLocale,
  problems: string[],
): Promise<void> {
  problems.length = 0;
  const response = await page.goto(path);
  expect(response?.status(), `${path} status`).toBeLessThan(400);
  await expect(page.locator("html"), `${path} lang`).toHaveAttribute("lang", locale);
  const heading = page.locator("h1").filter({ visible: true }).first();
  await expect(heading, `${path} heading`).toBeVisible();
  const text = (await heading.innerText()).trim();
  expect(isLocalizedHeading(text, locale), `${path} heading "${text}" is not ${locale} copy`).toBe(
    true,
  );
  // Hydration warnings arrive after the first paint, so wait for the page to settle first.
  await page.waitForLoadState("load");
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestIdleCallback(
          () => {
            resolve(null);
          },
          { timeout: 2000 },
        ),
      ),
  );
  expect(problems, `${path} problems`).toEqual([]);
}

async function setDeviceLocale(page: Page, locale: AppLocale): Promise<void> {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("the Playwright project has no baseURL");
  await page.context().addCookies([{ name: DEVICE_LOCALE_COOKIE, value: locale, url: baseURL }]);
}

for (const locale of LOCALES) {
  for (const path of PUBLIC_ROUTES) {
    test(`public ${path} renders in ${locale}`, async ({ page }) => {
      test.setTimeout(120_000);
      await setDeviceLocale(page, locale);
      await expectRouteRenders(page, path, locale, watchProblems(page));
    });
  }

  test(`owner routes render in ${locale}`, async ({ page }) => {
    test.setTimeout(600_000);
    const problems = watchProblems(page);
    const email = uniqueEmail(`smoke-${locale}`);
    await registerAndVerify(page, email, locale);
    const copy = ONBOARDING_COPY.messages[locale];
    await page.getByLabel(copy.nameLabel).fill("Smoke Studio");
    await page.getByRole("button", { name: copy.submit }).click();
    await expect(page).toHaveURL(/\/w\/[0-9a-f-]+/, { timeout: 60_000 });
    const workspaceId = new URL(page.url()).pathname.split("/")[2];

    const failures: string[] = [];
    for (const route of OWNER_ROUTES) {
      const path = route.replace(":id", workspaceId);
      try {
        await expectRouteRenders(page, path, locale, problems);
      } catch (error) {
        failures.push(`${path}: ${String(error).replaceAll(/\s+/g, " ").slice(0, 700)}`);
      }
    }
    expect(failures).toEqual([]);
  });
}

// Registered only when a public Drive folder is configured (GALLERY_SMOKE_FOLDER_URL).
// The gallery follows the owner's language, and publishedGallery registers an Indonesian owner.
if (FOLDER_URL) {
  test("client gallery renders in the owner's language (id)", async ({ page }) => {
    test.setTimeout(600_000);
    const problems = watchProblems(page);
    const { clientPath } = await publishedGallery(page);
    await expectRouteRenders(page, clientPath, "id", problems);
  });
}
