import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { SOURCE_COPY } from "@/features/gallery/ui/source-copy/source-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, label: string): Promise<string> {
  await page.setViewportSize(DESKTOP);
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Aster Wedding");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  const url = new URL(page.url());
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

async function openSources(page: Page, workspace: string): Promise<void> {
  await page.goto(`${workspace}/photo-sources`);
  await expect(page).toHaveURL(`${workspace}/photo-sources`);
  await expect(
    page.locator("#app-shell-content").getByRole("heading", { name: SOURCE_COPY.listTitle }),
  ).toBeVisible();
}

async function addSource(page: Page, name: string): Promise<void> {
  const desktop = page.locator("#app-shell-content");
  await desktop.getByRole("button", { name: SOURCE_COPY.add }).click();
  const dialog = page.getByRole("dialog", { name: SOURCE_COPY.addTitle });
  await dialog.getByRole("textbox", { name: SOURCE_COPY.nameLabel }).fill(name);
  await dialog.getByRole("button", { name: SOURCE_COPY.add }).click();
  await expect(desktop.getByText(name, { exact: true }).first()).toBeVisible();
}

test("AC-SRC-001 AC-SRC-003 AC-SRC-004 seeded source, navigation and legacy route", async ({
  page,
}) => {
  const workspace = await openWorkspace(page, "photo-sources-seeded");
  await page.getByRole("link", { name: OWNER_NAV_COPY.photoSources }).click();
  await expect(page).toHaveURL(`${workspace}/photo-sources`);
  await expect(page.getByRole("link", { name: OWNER_NAV_COPY.photoSources })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const desktop = page.locator("#app-shell-content");
  await expect(desktop.getByText("Google Drive", { exact: true }).first()).toBeVisible();
  await expect(desktop.getByText(SOURCE_COPY.active, { exact: true })).toBeVisible();
  await expect(desktop.getByRole("heading", { name: SOURCE_COPY.guideTitle })).toBeVisible();
  await expect(desktop.getByText(SOURCE_COPY.warningTitle, { exact: true })).toBeVisible();

  const legacyResponse = await page.goto(`${workspace}/client-sources`);
  expect(legacyResponse?.status()).toBe(404);
});

test("AC-SRC-005 AC-SRC-006 AC-SRC-009 AC-SRC-010 AC-SRC-011 AC-SRC-012 source lifecycle", async ({
  page,
}) => {
  const workspace = await openWorkspace(page, "photo-sources-lifecycle");
  await openSources(page, workspace);
  await addSource(page, "Google Drive Arsip");

  await page.getByRole("button", { name: SOURCE_COPY.add }).click();
  const duplicateDialog = page.getByRole("dialog", { name: SOURCE_COPY.addTitle });
  await duplicateDialog
    .getByRole("textbox", { name: SOURCE_COPY.nameLabel })
    .fill("google drive arsip");
  await duplicateDialog.getByRole("button", { name: SOURCE_COPY.add }).click();
  await expect(duplicateDialog.getByText(SOURCE_COPY.nameErrors.NAME_TAKEN)).toBeVisible();
  await page.keyboard.press("Escape");

  const seededActions = page.getByRole("button", {
    name: SOURCE_COPY.rowActions("Google Drive"),
    exact: true,
  });
  await seededActions.click();
  await page.getByRole("menuitem", { name: SOURCE_COPY.rename }).click();
  const renameDialog = page.getByRole("dialog", { name: SOURCE_COPY.renameTitle });
  await renameDialog
    .getByRole("textbox", { name: SOURCE_COPY.nameLabel })
    .fill("Google Drive Utama");
  await renameDialog.getByRole("button", { name: SOURCE_COPY.save }).click();
  await expect(
    page.locator("#app-shell-content").getByText("Google Drive Utama", { exact: true }).first(),
  ).toBeVisible();

  const archiveActions = page.getByRole("button", {
    name: SOURCE_COPY.rowActions("Google Drive Arsip"),
    exact: true,
  });
  await archiveActions.click();
  await page.getByRole("menuitem", { name: SOURCE_COPY.deactivate }).click();
  await expect(
    page.locator("#app-shell-content").getByText(SOURCE_COPY.inactive, { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: SOURCE_COPY.undo }).click();
  await expect(
    page.locator("#app-shell-content").getByText(SOURCE_COPY.active, { exact: true }),
  ).toHaveCount(2);

  await page
    .getByRole("button", { name: SOURCE_COPY.rowActions("Google Drive Arsip"), exact: true })
    .click();
  await page.getByRole("menuitem", { name: SOURCE_COPY.delete }).click();
  const deleteDialog = page.getByRole("alertdialog", {
    name: SOURCE_COPY.deleteTitle("Google Drive Arsip"),
  });
  await deleteDialog.getByRole("button", { name: SOURCE_COPY.deleteConfirm }).click();
  await expect(
    page.locator("#app-shell-content").getByText("Google Drive Arsip", { exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: SOURCE_COPY.rowActions("Google Drive Utama"), exact: true })
    .click();
  await page.getByRole("menuitem", { name: SOURCE_COPY.delete }).click();
  await page
    .getByRole("alertdialog", { name: SOURCE_COPY.deleteTitle("Google Drive Utama") })
    .getByRole("button", { name: SOURCE_COPY.deleteConfirm })
    .click();
  await expect(
    page.locator("#app-shell-content").getByText(SOURCE_COPY.emptyTitle, { exact: true }),
  ).toBeVisible();
});

test("AC-SRC-015 another owner cannot open the first owner's sources", async ({
  browser,
  page,
}) => {
  const workspace = await openWorkspace(page, "photo-sources-owner-a");
  const other = await browser.newPage();
  try {
    await openWorkspace(other, "photo-sources-owner-b");
    await other.goto(`${workspace}/photo-sources`);
    await expect(
      other.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.title }),
    ).toBeVisible();
  } finally {
    await other.close();
  }
});

test("AC-SRC-017 list, dialogs and keyboard path have no axe violations", async ({ page }) => {
  const workspace = await openWorkspace(page, "photo-sources-a11y");
  await openSources(page, workspace);

  for (const viewport of [DESKTOP, PHONE]) {
    await page.setViewportSize(viewport);
    const tree = page.locator(
      viewport.width === PHONE.width ? "#mobile-app-content" : "#app-shell-content",
    );
    await expect(tree.getByRole("heading", { name: SOURCE_COPY.listTitle })).toBeVisible();
    const listResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(listResults.violations).toEqual([]);

    const addButtonName = viewport.width === PHONE.width ? SOURCE_COPY.addShort : SOURCE_COPY.add;
    await tree.getByRole("button", { name: addButtonName }).click();
    await expect(page.locator("[data-entering]")).toHaveCount(0);
    const addResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(addResults.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(tree.getByRole("heading", { name: SOURCE_COPY.listTitle })).toBeVisible();
  }

  await page.setViewportSize(DESKTOP);
  const rowActions = page
    .locator("#app-shell-content")
    .getByRole("button", { name: SOURCE_COPY.rowActions("Google Drive") });
  await expect(rowActions).toBeVisible();
  await rowActions.focus();
  await expect(rowActions).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: SOURCE_COPY.rename })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(rowActions).toBeFocused();
  await rowActions.click();
  await page.getByRole("menuitem", { name: SOURCE_COPY.delete }).click();
  const deleteResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(deleteResults.violations).toEqual([]);
});
