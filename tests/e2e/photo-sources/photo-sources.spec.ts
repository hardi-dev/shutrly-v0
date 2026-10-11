import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { SOURCE_COPY_NAMESPACE } from "@/features/gallery/ui/source-copy/source-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const copy = copyTranslator(SOURCE_COPY_NAMESPACE, "id");

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, label: string): Promise<string> {
  await page.setViewportSize(DESKTOP);
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Aster Wedding");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  const url = new URL(page.url());
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

async function openSources(page: Page, workspace: string): Promise<void> {
  await page.goto(`${workspace}/photo-sources`);
  await expect(page).toHaveURL(`${workspace}/photo-sources`);
  await expect(
    page.locator("#app-shell-content").getByRole("heading", { name: copy("listTitle") }),
  ).toBeVisible();
}

async function addSource(page: Page, name: string): Promise<void> {
  const desktop = page.locator("#app-shell-content");
  await desktop.getByRole("button", { name: copy("add") }).click();
  const dialog = page.getByRole("dialog", { name: copy("addTitle") });
  await dialog.getByRole("textbox", { name: copy("nameLabel") }).fill(name);
  await dialog.getByRole("button", { name: copy("add") }).click();
  await expect(desktop.getByText(name, { exact: true }).first()).toBeVisible();
}

test("AC-SRC-001 AC-SRC-003 AC-SRC-004 seeded source, navigation and legacy route", async ({
  page,
}) => {
  const workspace = await openWorkspace(page, "photo-sources-seeded");
  await page.getByRole("link", { name: OWNER_NAV_COPY.messages.id.photoSources }).click();
  await expect(page).toHaveURL(`${workspace}/photo-sources`);
  await expect(
    page.getByRole("link", { name: OWNER_NAV_COPY.messages.id.photoSources }),
  ).toHaveAttribute("aria-current", "page");
  const desktop = page.locator("#app-shell-content");
  await expect(desktop.getByText("Google Drive", { exact: true }).first()).toBeVisible();
  await expect(desktop.getByText(copy("active"), { exact: true })).toBeVisible();
  await expect(desktop.getByRole("heading", { name: copy("guideTitle") })).toBeVisible();
  await expect(desktop.getByText(copy("warningTitle"), { exact: true })).toBeVisible();

  const legacyResponse = await page.goto(`${workspace}/client-sources`);
  expect(legacyResponse?.status()).toBe(404);
});

test("AC-SRC-005 AC-SRC-006 AC-SRC-009 AC-SRC-010 AC-SRC-011 AC-SRC-012 source lifecycle", async ({
  page,
}) => {
  const workspace = await openWorkspace(page, "photo-sources-lifecycle");
  await openSources(page, workspace);
  await addSource(page, "Google Drive Arsip");

  await page.getByRole("button", { name: copy("add") }).click();
  const duplicateDialog = page.getByRole("dialog", { name: copy("addTitle") });
  await duplicateDialog
    .getByRole("textbox", { name: copy("nameLabel") })
    .fill("google drive arsip");
  await duplicateDialog.getByRole("button", { name: copy("add") }).click();
  await expect(duplicateDialog.getByText(copy("nameErrorNameTaken"))).toBeVisible();
  await page.keyboard.press("Escape");

  const seededActions = page.getByRole("button", {
    name: copy("rowActions", { name: "Google Drive" }),
    exact: true,
  });
  await seededActions.click();
  await page.getByRole("menuitem", { name: copy("rename") }).click();
  const renameDialog = page.getByRole("dialog", { name: copy("renameTitle") });
  await renameDialog.getByRole("textbox", { name: copy("nameLabel") }).fill("Google Drive Utama");
  await renameDialog.getByRole("button", { name: copy("save") }).click();
  await expect(
    page.locator("#app-shell-content").getByText("Google Drive Utama", { exact: true }).first(),
  ).toBeVisible();

  const archiveActions = page.getByRole("button", {
    name: copy("rowActions", { name: "Google Drive Arsip" }),
    exact: true,
  });
  await archiveActions.click();
  await page.getByRole("menuitem", { name: copy("deactivate") }).click();
  await expect(
    page.locator("#app-shell-content").getByText(copy("inactive"), { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: copy("undo") }).click();
  await expect(
    page.locator("#app-shell-content").getByText(copy("active"), { exact: true }),
  ).toHaveCount(2);

  await page
    .getByRole("button", { name: copy("rowActions", { name: "Google Drive Arsip" }), exact: true })
    .click();
  await page.getByRole("menuitem", { name: copy("delete") }).click();
  const deleteDialog = page.getByRole("alertdialog", {
    name: copy("deleteTitle", { name: "Google Drive Arsip" }),
  });
  await deleteDialog.getByRole("button", { name: copy("deleteConfirm") }).click();
  await expect(
    page.locator("#app-shell-content").getByText("Google Drive Arsip", { exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: copy("rowActions", { name: "Google Drive Utama" }), exact: true })
    .click();
  await page.getByRole("menuitem", { name: copy("delete") }).click();
  await page
    .getByRole("alertdialog", { name: copy("deleteTitle", { name: "Google Drive Utama" }) })
    .getByRole("button", { name: copy("deleteConfirm") })
    .click();
  await expect(
    page.locator("#app-shell-content").getByText(copy("emptyTitle"), { exact: true }),
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
      other.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.messages.id.title }),
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
    await expect(tree.getByRole("heading", { name: copy("listTitle") })).toBeVisible();
    const listResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(listResults.violations).toEqual([]);

    const addButtonName = viewport.width === PHONE.width ? copy("addShort") : copy("add");
    await tree.getByRole("button", { name: addButtonName }).click();
    await expect(page.locator("[data-entering]")).toHaveCount(0);
    const addResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(addResults.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(tree.getByRole("heading", { name: copy("listTitle") })).toBeVisible();
  }

  await page.setViewportSize(DESKTOP);
  const rowActions = page
    .locator("#app-shell-content")
    .getByRole("button", { name: copy("rowActions", { name: "Google Drive" }) });
  await expect(rowActions).toBeVisible();
  await rowActions.focus();
  await expect(rowActions).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: copy("rename") })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(rowActions).toBeFocused();
  await rowActions.click();
  await page.getByRole("menuitem", { name: copy("delete") }).click();
  const deleteResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(deleteResults.violations).toEqual([]);
});
