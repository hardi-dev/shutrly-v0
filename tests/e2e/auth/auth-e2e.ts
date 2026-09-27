import { expect, type Page } from "@playwright/test";

import { REGISTER_FORM_COPY } from "@/features/auth/ui/register-form/register-form.copy";

export const PASSWORD = "correct-horse";

export const uniqueEmail = (tag = "e2e") => `${tag}+${crypto.randomUUID()}@test.shutrly.dev`;

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

export async function register(page: Page, email: string): Promise<void> {
  const octets = crypto
    .randomUUID()
    .replaceAll("-", "")
    .match(/.{1,2}/g)
    ?.slice(0, 4)
    .map((part) => Number.parseInt(part, 16));
  if (!octets || octets.length !== 4) throw new Error("failed to create an E2E client IP");
  await page.setExtraHTTPHeaders({ "cf-connecting-ip": octets.join(".") });
  await page.goto("/register");
  await page.getByLabel(REGISTER_FORM_COPY.name).fill("Alya Pratama");
  await page.getByLabel(REGISTER_FORM_COPY.email).fill(email);
  await page.getByRole("textbox", { name: REGISTER_FORM_COPY.password }).fill(PASSWORD);
  await page.getByRole("button", { name: REGISTER_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/verify$/);
}

export async function registerAndVerify(page: Page, email: string): Promise<void> {
  await register(page, email);
  await page.goto(await lastLink(page, email, "VERIFY_EMAIL"));
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
}
