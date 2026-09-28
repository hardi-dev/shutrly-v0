import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { COMING_SOON_COPY } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen.copy";
import { CREATE_WORKSPACE_COPY } from "@/features/workspace/ui/create-workspace-dialog/create-workspace-dialog.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { SETTINGS_COPY } from "@/features/workspace/ui/settings-screen/settings-screen.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";
import { WORKSPACE_SWITCHER_COPY } from "@/features/workspace/ui/workspace-switcher/workspace-switcher.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

test("AC-WS-002 AC-WS-007 AC-WS-016 workspace onboarding, settings and create flow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await registerAndVerify(page, uniqueEmail("workspace"));
  await expect(page.getByRole("heading", { name: ONBOARDING_COPY.title })).toBeVisible();

  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Aster Wedding");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+$/);
  const firstWorkspaceUrl = page.url();

  await expect(page.getByRole("heading", { name: "Aster Wedding" })).toBeVisible();
  await page.goto(`${firstWorkspaceUrl}/settings`);
  await page.locator('input[name="name"]:visible').fill("Aster Wedding Studio");
  await page.locator('input[name="brandName"]:visible').fill("Aster Studio");
  await page.locator('input[name="contactEmail"]:visible').fill("studio@example.com");
  await page.getByRole("button", { name: SETTINGS_COPY.save }).click();
  await expect(page.getByText(SETTINGS_COPY.saved, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: WORKSPACE_SWITCHER_COPY.trigger }).click();
  await page.getByRole("menuitem", { name: WORKSPACE_SWITCHER_COPY.create }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(CREATE_WORKSPACE_COPY.label).fill("Studio Baru");
  await dialog.getByRole("button", { name: CREATE_WORKSPACE_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "Studio Baru" })).toBeVisible();
});

test("AC-WS-022 AC-WS-025 workspace shell is accessible and unbuilt sections are safe", async ({
  page,
}) => {
  await registerAndVerify(page, uniqueEmail("workspace-a11y"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Accessibility Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+$/);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }

  await page.getByRole("link", { name: "Proyek" }).click();
  await expect(page.getByRole("heading", { name: COMING_SOON_COPY.title })).toBeVisible();
  await expect(page.getByRole("link", { name: COMING_SOON_COPY.back })).toBeVisible();
});

test("AC-WS-012 an unknown workspace is not found", async ({ page }) => {
  await registerAndVerify(page, uniqueEmail("workspace-not-found"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Not Found Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+$/);
  await page.goto("/w/00000000-0000-0000-0000-000000000000");
  await expect(page.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.title })).toBeVisible();
});
