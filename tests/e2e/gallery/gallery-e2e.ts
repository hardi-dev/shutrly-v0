import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Runs axe once animations settle; no violations allowed (AC-GAL-026). */
export async function expectGalleryA11y(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .exclude('[role="log"][aria-relevant="additions"]')
    .analyze();
  expect(results.violations).toEqual([]);
}

/** The first visible element with this text. */
export function visibleText(page: Page, text: string) {
  return page.getByText(text).filter({ visible: true }).first();
}

/** Registers an Owner, creates a workspace with client *Rina* and service *Wisuda Basic*. @returns the workspace id */
export async function openGalleryWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("gallery"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Gallery Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  const workspaceId = new URL(page.url()).pathname.split("/")[2];
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  return workspaceId;
}

async function addClient(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Rina");
  await dialog.getByRole("textbox", { name: CLIENT_COPY.whatsappNumber }).fill("0812-3456-7890");
  await dialog.getByRole("button", { name: CLIENT_COPY.save }).click();
  await expect(dialog).toBeHidden();
}

async function addService(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/services`);
  await page
    .getByRole("button", { name: CATALOG_COPY.addService })
    .filter({ visible: true })
    .first()
    .click();
  const serviceDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.addServiceTitle })
    .filter({ visible: true })
    .first();
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.addCategoryInline }).click();
  const categoryDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.categoryDialogAddTitle })
    .filter({ visible: true })
    .first();
  await categoryDialog.getByRole("textbox", { name: CATALOG_COPY.nameCategory }).fill("Wisuda");
  await categoryDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(categoryDialog).toBeHidden();
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.nameService }).fill("Wisuda Basic");
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.basePrice }).fill("750000");
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(page).toHaveURL(/\/services\/[0-9a-f-]+$/);
}

/** Creates a project for *Rina*: BOOKED with one session, or a DRAFT. @returns the project page path */
export async function createProject(
  page: Page,
  workspaceId: string,
  mode: "BOOKED" | "DRAFT",
): Promise<string> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: PROJECT_COPY.clientLabel }).click();
  await page.getByRole("option", { name: /Rina/ }).click();
  await page.getByRole("button", { name: new RegExp(PROJECT_COPY.serviceLabel) }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
  if (mode === "BOOKED") {
    await page.getByRole("button", { name: PROJECT_COPY.addSessionDesktop }).click();
    const dialog = page
      .getByRole("dialog", { name: PROJECT_COPY.sessionDialogTitle })
      .filter({ visible: true });
    await dialog.getByRole("textbox", { name: PROJECT_COPY.sessionName }).fill("Wisuda");
    await dialog.getByRole("button", { name: new RegExp(PROJECT_COPY.sessionDate) }).click();
    await page.getByRole("grid").getByText("15", { exact: true }).first().click();
    await dialog.getByRole("button", { name: PROJECT_COPY.sessionSave }).click();
    await expect(dialog).toBeHidden();
  }
  const submit = mode === "BOOKED" ? PROJECT_COPY.create : PROJECT_COPY.saveDraft;
  await page.getByRole("button", { name: submit }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=/);
  return new URL(page.url()).pathname;
}
