import { expect, test } from "@playwright/test";

import { CHANGE_PASSWORD_FORM_COPY } from "@/features/auth/ui/change-password-form/change-password-form.copy";
import { CONTROLLED_TEXT_FIELD_COPY } from "@/features/auth/ui/controlled-text-field/controlled-text-field.copy";
import { PROFILE_FORM_COPY } from "@/features/auth/ui/profile-form/profile-form.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { PASSWORD, registerAndVerify, uniqueEmail } from "./auth-e2e";

test.setTimeout(60_000);

test("AC-AUTH-019 AC-AUTH-020 update the name and change the password", async ({ page }) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  // BR-AUTH-004: an owner with no workspace is sent to onboarding, so create one first.
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Profile Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+/);
  await page.goto("/profile");
  // The shell renders the page in a desktop and a phone tree; use the visible desktop one.
  const profile = page.locator("#app-shell-content");
  await expect(profile.getByLabel(PROFILE_FORM_COPY.messages.id.email)).toHaveValue(email);

  await profile.getByLabel(PROFILE_FORM_COPY.messages.id.name).fill("Alya P.");
  await profile.getByRole("button", { name: PROFILE_FORM_COPY.messages.id.save }).click();
  await expect(
    profile.getByRole("status").filter({ hasText: PROFILE_FORM_COPY.messages.id.saved }),
  ).toHaveText(PROFILE_FORM_COPY.messages.id.saved);

  const copy = CHANGE_PASSWORD_FORM_COPY.messages.id;
  await profile.getByRole("textbox", { name: copy.current }).fill("wrong-horse");
  await profile.getByRole("textbox", { name: copy.next, exact: true }).fill("new-horse-1");
  await profile.getByRole("textbox", { name: copy.confirm, exact: true }).fill("new-horse-1");
  await profile.getByRole("button", { name: copy.submit }).click();
  await expect(
    profile.getByText(CONTROLLED_TEXT_FIELD_COPY.messages.id.passwordWrongCurrent),
  ).toBeVisible();

  await profile.getByRole("textbox", { name: copy.current }).fill(PASSWORD);
  await profile.getByRole("button", { name: copy.submit }).click();
  await expect(profile.locator("form").nth(1).locator('button[type="submit"]')).toBeEnabled({
    timeout: 45_000,
  });
  await expect(profile.getByRole("status").filter({ hasText: copy.done })).toHaveText(copy.done);
});
