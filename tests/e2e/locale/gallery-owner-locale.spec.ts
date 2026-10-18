import { expect, type Page, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { CLIENT_GATE_SCREEN_COPY_NAMESPACE } from "@/features/gallery/ui/client-gate-screen/client-gate-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { OWNER_SHELL_COPY } from "@/features/workspace/ui/owner-shell/owner-shell.copy";
import type { AppLocale } from "@/shared/locale/locale.types";
import { LANGUAGE_SWITCH_COPY } from "@/ui/patterns/language-switch/language-switch.copy";

import { FOLDER_URL, linkedGallery } from "../client-access/client-access-e2e";

// Needs the real public folder from .env.test, because the gallery is linked to it.
test.skip(!FOLDER_URL, "GALLERY_SMOKE_FOLDER_URL is not set");
test.setTimeout(300_000);

const DESKTOP = { width: 1440, height: 900 };

const other = (locale: AppLocale): AppLocale => (locale === "en" ? "id" : "en");
const labelKeyOf = (locale: AppLocale) => (locale === "en" ? "english" : "indonesian");
const gateCopy = (locale: AppLocale) => copyTranslator(CLIENT_GATE_SCREEN_COPY_NAMESPACE, locale);
const passwordCopy = (locale: AppLocale) =>
  copyTranslator(CLIENT_PASSWORD_FORM_COPY_NAMESPACE, locale);

async function currentLocale(page: Page): Promise<AppLocale> {
  const lang = await page.locator("html").getAttribute("lang");
  return lang === "en" ? "en" : "id";
}

/** The client's password gate must render in one language: the html lang and the gate copy. */
async function expectGateIn(page: Page, locale: AppLocale): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("lang", locale, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: gateCopy(locale)("title") })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByLabel(passwordCopy(locale)("password"))).toBeVisible({
    timeout: 30_000,
  });
}

/** Desktop: the owner's account menu opens and the language row switches the owner's language. */
async function switchOwnerLanguage(page: Page, target: AppLocale): Promise<void> {
  const current = await currentLocale(page);
  await page
    .getByRole("button", { name: OWNER_SHELL_COPY.messages[current].accountMenu, exact: true })
    .click();
  await page
    .getByRole("menu")
    .getByRole("menuitem", {
      name: LANGUAGE_SWITCH_COPY.messages[current][labelKeyOf(target)],
      exact: true,
    })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", target, { timeout: 30_000 });
}

test("AC-L10N-001 a gallery renders in the owner's language and follows an owner switch", async ({
  page,
  browser,
}) => {
  await page.setViewportSize(DESKTOP);
  const { clientPath } = await linkedGallery(page);
  const ownerLocale = await currentLocale(page);
  const target = other(ownerLocale);

  const client = await browser.newContext({ viewport: DESKTOP });
  try {
    // A fresh visitor (no owner session) opens the client link: the gallery owner's language.
    const visitor = await client.newPage();
    await visitor.goto(clientPath);
    await expectGateIn(visitor, ownerLocale);

    // The owner switches language, then the client page reloads and follows the new locale.
    await switchOwnerLanguage(page, target);
    await visitor.reload();
    await expectGateIn(visitor, target);
  } finally {
    await client.close();
  }
});
