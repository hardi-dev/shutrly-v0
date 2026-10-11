import { expect, type Page, test } from "@playwright/test";

import { REGISTER_FORM_COPY } from "@/features/auth/ui/register-form/register-form.copy";
import type { AppLocale } from "@/shared/locale/locale.types";

export const PASSWORD = "correct-horse";

// The device locale cookie (DEVICE_LOCALE_COOKIE). Named here because the composition module
// it lives in is server-only and cannot load in the Playwright runner.
const DEVICE_LOCALE_COOKIE = "shutrly_locale";

export const uniqueEmail = (tag = "e2e") =>
  `${tag.toLowerCase().replaceAll(/[^a-z0-9-]+/g, "-")}+${crypto.randomUUID()}@test.shutrly.dev`;

interface CapturedLink {
  kind: string;
  url: string;
}

/** The newest captured link of a kind for a recipient (E2E_EMAIL_CAPTURE=1 in .dev.vars). */
export async function lastLink(page: Page, to: string, kind: string): Promise<string> {
  let url: string | undefined;
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/test/auth-emails?to=${encodeURIComponent(to)}`);
      const links = (await response.json()) as CapturedLink[];
      url = links.filter((link) => link.kind === kind).at(-1)?.url;
      return url;
    })
    .toBeTruthy();
  return url ?? "";
}

/** Sets the device locale before sign-up, so the new owner's `user.locale` is this language (D-22). */
async function setDeviceLocale(page: Page, locale: AppLocale): Promise<void> {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("the Playwright project has no baseURL");
  await page.context().addCookies([{ name: DEVICE_LOCALE_COOKIE, value: locale, url: baseURL }]);
}

export async function register(page: Page, email: string, locale: AppLocale = "id"): Promise<void> {
  const copy = REGISTER_FORM_COPY.messages[locale];
  await setDeviceLocale(page, locale);
  const octets = crypto
    .randomUUID()
    .replaceAll("-", "")
    .match(/.{1,2}/g)
    ?.slice(0, 4)
    .map((part) => Number.parseInt(part, 16));
  if (!octets || octets.length !== 4) throw new Error("failed to create an E2E client IP");
  await page.setExtraHTTPHeaders({ "cf-connecting-ip": octets.join(".") });
  await page.goto("/register");
  await page.getByLabel(copy.name).fill("Alya Pratama");
  await page.getByLabel(copy.email).fill(email);
  await page.getByRole("textbox", { name: copy.password }).fill(PASSWORD);
  await page.getByRole("button", { name: copy.submit }).click();
  try {
    await expect(page).toHaveURL(/\/verify$/);
  } catch (error) {
    const alerts = await page.getByRole("alert").allTextContents();
    throw new Error(`${String(error)}\nRegistration alerts: ${alerts.join(" | ")}`);
  }
}

export async function registerAndVerify(
  page: Page,
  email: string,
  locale: AppLocale = "id",
): Promise<void> {
  await register(page, email, locale);
  await page.goto(await lastLink(page, email, "VERIFY_EMAIL"));
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
}
