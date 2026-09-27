import { expect, test } from "@playwright/test";

import { AUTH_ERROR_COPY } from "@/features/auth/ui/auth-error-alert/auth-error-alert.copy";
import { INVALID_VERIFY_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.copy";
import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { VERIFY_PENDING_SCREEN_COPY } from "@/features/auth/ui/verify-pending-screen/verify-pending-screen.copy";

import { lastLink, PASSWORD, register, registerAndVerify, uniqueEmail } from "./auth-e2e";

test("J-01 AC-AUTH-001 AC-AUTH-004 register → verify → first-workspace hand-off", async ({
  page,
}) => {
  const email = uniqueEmail();
  await register(page, email);
  await expect(page.getByRole("heading", { name: VERIFY_PENDING_SCREEN_COPY.title })).toBeVisible();
  await page.goto(await lastLink(page, email, "VERIFY_EMAIL"));
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-005 a used verification link shows the invalid-link screen", async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  const link = await lastLink(page, email, "VERIFY_EMAIL");
  await page.goto(link);
  await page.context().clearCookies();
  await page.goto(link);
  const heading = page.getByRole("heading", { name: INVALID_VERIFY_LINK_SCREEN_COPY.title });
  await expect(heading).toBeVisible();
});

test("AC-AUTH-008 AC-AUTH-011 login errors, then a signed-in owner skips /login", async ({
  page,
}) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel(LOGIN_FORM_COPY.email).fill(email);
  await page.getByRole("textbox", { name: LOGIN_FORM_COPY.password }).fill("wrong-horse");
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  const alert = page.getByRole("alert").filter({ hasText: AUTH_ERROR_COPY.INVALID_CREDENTIALS });
  await expect(alert).toHaveText(AUTH_ERROR_COPY.INVALID_CREDENTIALS);
  await expect(alert).toBeFocused();
  await page.getByRole("textbox", { name: LOGIN_FORM_COPY.password }).fill(PASSWORD);
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-009 an unverified session is confined to verification", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/(verify|login)$/);
});

test("AC-AUTH-029 a cancelled Google sign-in explains itself on login", async ({ page }) => {
  await page.goto("/login?error=access_denied");
  await expect(
    page.getByRole("alert").filter({ hasText: AUTH_ERROR_COPY.GOOGLE_CANCELLED }),
  ).toHaveText(AUTH_ERROR_COPY.GOOGLE_CANCELLED);
});
