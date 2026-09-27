import { expect, test } from "@playwright/test";

import { CHANGE_PASSWORD_FORM_COPY } from "@/features/auth/ui/change-password-form/change-password-form.copy";
import { FIELD_ERROR_COPY } from "@/features/auth/ui/controlled-text-field/controlled-text-field.copy";
import { PROFILE_FORM_COPY } from "@/features/auth/ui/profile-form/profile-form.copy";

import { PASSWORD, registerAndVerify, uniqueEmail } from "./auth-e2e";

test.setTimeout(60_000);

test("AC-AUTH-019 AC-AUTH-020 update the name and change the password", async ({ page }) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.goto("/profile");
  await expect(page.getByLabel(PROFILE_FORM_COPY.email)).toHaveValue(email);

  await page.getByLabel(PROFILE_FORM_COPY.name).fill("Alya P.");
  await page.getByRole("button", { name: PROFILE_FORM_COPY.save }).click();
  await expect(page.getByRole("status").filter({ hasText: PROFILE_FORM_COPY.saved })).toHaveText(
    PROFILE_FORM_COPY.saved,
  );

  const copy = CHANGE_PASSWORD_FORM_COPY;
  await page.getByRole("textbox", { name: copy.current }).fill("wrong-horse");
  await page.getByRole("textbox", { name: copy.next, exact: true }).fill("new-horse-1");
  await page.getByRole("textbox", { name: copy.confirm, exact: true }).fill("new-horse-1");
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(FIELD_ERROR_COPY["password.wrongCurrent"])).toBeVisible();

  await page.getByRole("textbox", { name: copy.current }).fill(PASSWORD);
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.locator("form").nth(1).locator('button[type="submit"]')).toBeEnabled({
    timeout: 45_000,
  });
  await expect(page.getByRole("status").filter({ hasText: copy.done })).toHaveText(copy.done);
});
