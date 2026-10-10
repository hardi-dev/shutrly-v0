import { expect, type Page, test } from "@playwright/test";

import { LOGIN_SCREEN_COPY } from "@/features/auth/ui/login-screen/login-screen.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_SHELL_COPY } from "@/features/workspace/ui/owner-shell/owner-shell.copy";
import type { AppLocale } from "@/shared/locale/locale.types";
import { LANGUAGE_SWITCH_COPY } from "@/ui/patterns/language-switch/language-switch.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

// A hydration or missing-message warning is a failure, not noise (I1 done-when).
const hydrationProblems: string[] = [];
test.beforeEach(({ page }) => {
  hydrationProblems.length = 0;
  page.on("console", (message) => {
    if (/hydrat|missing message/i.test(message.text())) hydrationProblems.push(message.text());
  });
});
test.afterEach(() => {
  expect(hydrationProblems).toEqual([]);
});

test.setTimeout(90_000);

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

const other = (locale: AppLocale): AppLocale => (locale === "en" ? "id" : "en");
const labelKeyOf = (locale: AppLocale) => (locale === "en" ? "english" : "indonesian");

async function currentLocale(page: Page): Promise<AppLocale> {
  const lang = await page.locator("html").getAttribute("lang");
  return lang === "id" ? "id" : "en";
}

/** Signs in a fresh owner with a workspace, so the owner shell renders (user.locale starts at en). */
async function openOwnerWorkspace(page: Page): Promise<void> {
  await registerAndVerify(page, uniqueEmail("owner-language"));
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Language Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  // Better Auth's scrypt and the first owner-route compile are slow in dev (see auth-profile.spec.ts).
  // The redirect may carry a ?state=created query, so the pattern does not anchor the end.
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+/, { timeout: 45_000 });
}

/** Desktop: the sidebar account block opens the account menu; pick the language row. */
async function chooseFromAccountMenu(page: Page, target: AppLocale): Promise<void> {
  const current = await currentLocale(page);
  await page
    .getByRole("button", { name: OWNER_SHELL_COPY.messages[current].accountMenu, exact: true })
    .click();
  const menu = page.getByRole("menu");
  await menu
    .getByRole("menuitem", {
      name: LANGUAGE_SWITCH_COPY.messages[current][labelKeyOf(target)],
      exact: true,
    })
    .click();
  // The switch saves, then refreshes the route; a cold dev compile can take several seconds.
  await expect(page.locator("html")).toHaveAttribute("lang", target, { timeout: 30_000 });
}

/** Phone: the ≡ menu sheet opens the Language sheet, then the chosen language is tapped. */
async function chooseFromMobileMenu(page: Page, target: AppLocale): Promise<void> {
  const current = await currentLocale(page);
  await page
    .getByRole("button", { name: OWNER_SHELL_COPY.messages[current].menu, exact: true })
    .click();
  await page
    .getByRole("button", {
      name: LANGUAGE_SWITCH_COPY.messages[current].accessibleName,
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", {
      name: LANGUAGE_SWITCH_COPY.messages[current][labelKeyOf(target)],
      exact: true,
    })
    .click();
  // The switch saves, then refreshes the route; a cold dev compile can take several seconds.
  await expect(page.locator("html")).toHaveAttribute("lang", target, { timeout: 30_000 });
}

test.describe("desktop 1440 × 900", () => {
  test.use({ viewport: DESKTOP });

  test("BR-L10N-001 an owner switches to English from the account menu and keeps the page", async ({
    page,
  }) => {
    await openOwnerWorkspace(page);
    // A new owner starts in English; move to Indonesian first so the switch to English changes something.
    if ((await currentLocale(page)) === "en") await chooseFromAccountMenu(page, "id");
    const url = page.url();

    await chooseFromAccountMenu(page, "en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(page.url()).toBe(url);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(page.url()).toBe(url);
  });

  test("D-22 after sign-out the sign-in screen keeps the owner's language", async ({ page }) => {
    await openOwnerWorkspace(page);
    await chooseFromAccountMenu(page, other(await currentLocale(page)));
    const chosen = await currentLocale(page);

    const current = chosen;
    await page
      .getByRole("button", { name: OWNER_SHELL_COPY.messages[current].accountMenu, exact: true })
      .click();
    await page
      .getByRole("menu")
      .getByRole("menuitem", { name: OWNER_SHELL_COPY.messages[current].logout, exact: true })
      .click();

    await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", chosen);
    if (chosen === "id") {
      await expect(
        page.getByRole("heading", { name: LOGIN_SCREEN_COPY.messages.id.title, exact: true }),
      ).toBeVisible();
    }
  });
});

test.describe("390 × 844", () => {
  test.use({ viewport: PHONE });

  test("AC-L10N-001 an owner switches language from the mobile menu sheet", async ({ page }) => {
    await openOwnerWorkspace(page);
    const url = page.url();
    const before = await currentLocale(page);

    await chooseFromMobileMenu(page, other(before));
    expect(await currentLocale(page)).toBe(other(before));
    expect(page.url()).toBe(url);
  });
});
