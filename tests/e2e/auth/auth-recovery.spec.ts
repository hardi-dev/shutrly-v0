import { expect, test } from "@playwright/test";

import { FORGOT_PASSWORD_FORM_COPY } from "@/features/auth/ui/forgot-password-form/forgot-password-form.copy";
import { INVALID_RESET_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.copy";
import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { RESET_PASSWORD_FORM_COPY } from "@/features/auth/ui/reset-password-form/reset-password-form.copy";
import { RESET_SENT_SCREEN_COPY } from "@/features/auth/ui/reset-sent-screen/reset-sent-screen.copy";

import { lastLink, registerAndVerify, uniqueEmail } from "./auth-e2e";

const NEW_PASSWORD = "new-horse-1";

test("AC-AUTH-016 AC-AUTH-017 forgot → reset → sign in with the new password", async ({ page }) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.context().clearCookies();
  await page.goto("/forgot-password");
  await page.getByLabel(FORGOT_PASSWORD_FORM_COPY.email).fill(email);
  await page.getByRole("button", { name: FORGOT_PASSWORD_FORM_COPY.submit }).click();
  await expect(page.getByRole("heading", { name: RESET_SENT_SCREEN_COPY.title })).toBeVisible();

  const link = await lastLink(page, email, "RESET_PASSWORD");
  await page.goto(link);
  await page
    .getByRole("textbox", { name: RESET_PASSWORD_FORM_COPY.password, exact: true })
    .fill(NEW_PASSWORD);
  await page
    .getByRole("textbox", { name: RESET_PASSWORD_FORM_COPY.confirm, exact: true })
    .fill(NEW_PASSWORD);
  await page.getByRole("button", { name: RESET_PASSWORD_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto(link);
  const expired = page.getByRole("heading", { name: INVALID_RESET_LINK_SCREEN_COPY.title });
  await expect(expired).toBeVisible();

  await page.goto("/login");
  await page.getByLabel(LOGIN_FORM_COPY.email).fill(email);
  await page.getByRole("textbox", { name: LOGIN_FORM_COPY.password }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-016 an unknown email sees the same confirmation", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel(FORGOT_PASSWORD_FORM_COPY.email).fill(uniqueEmail("nobody"));
  await page.getByRole("button", { name: FORGOT_PASSWORD_FORM_COPY.submit }).click();
  await expect(page.getByRole("heading", { name: RESET_SENT_SCREEN_COPY.title })).toBeVisible();
});
