import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY_NAMESPACE } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY_NAMESPACE } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const pc = copyTranslator(PROJECT_COPY_NAMESPACE, "id");

const clientT = copyTranslator(CLIENT_COPY_NAMESPACE, "id");

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

/** Registers an Owner, creates a workspace with client *Rina* and service *Wisuda Basic*. @param email - the Owner's email, unique per run by default @returns the workspace id */
export async function openGalleryWorkspace(
  page: Page,
  email: string = uniqueEmail("gallery"),
): Promise<string> {
  await registerAndVerify(page, email);
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Gallery Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  // Creating the workspace seeds defaults; a cold dev compile can take tens of seconds.
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/, { timeout: 45_000 });
  const workspaceId = new URL(page.url()).pathname.split("/")[2];
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  return workspaceId;
}

async function addClient(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page
    .getByRole("button", { name: clientT("addClient") })
    .first()
    .click();
  const dialog = page
    .getByRole("dialog", { name: clientT("dialogTitle") })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: clientT("name") }).fill("Rina");
  await dialog.getByRole("textbox", { name: clientT("whatsappNumber") }).fill("0812-3456-7890");
  await dialog.getByRole("button", { name: clientT("saveAdd") }).click();
  // The first save compiles the action in dev.
  await expect(dialog).toBeHidden({ timeout: 30_000 });
}

async function addService(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/services`);
  await page
    .getByRole("button", { name: CATALOG_COPY.messages.id.addService })
    .filter({ visible: true })
    .first()
    .click();
  const serviceDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.messages.id.addServiceTitle })
    .filter({ visible: true })
    .first();
  await serviceDialog
    .getByRole("button", { name: CATALOG_COPY.messages.id.addCategoryInline })
    .click();
  const categoryDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.messages.id.categoryDialogAddTitle })
    .filter({ visible: true })
    .first();
  await categoryDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.nameCategory })
    .fill("Wisuda");
  await categoryDialog.getByRole("button", { name: CATALOG_COPY.messages.id.save }).click();
  await expect(categoryDialog).toBeHidden({ timeout: 30_000 });
  await serviceDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.nameService })
    .fill("Wisuda Basic");
  await serviceDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.basePrice })
    .fill("750000");
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.messages.id.save }).click();
  await expect(page).toHaveURL(/\/services\/[0-9a-f-]+$/, { timeout: 30_000 });
}

/** Creates a project for *Rina*: BOOKED with one session, or a DRAFT. @returns the project page path */
export async function createProject(
  page: Page,
  workspaceId: string,
  mode: "BOOKED" | "DRAFT",
): Promise<string> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: pc("clientLabel") }).click();
  await page.getByRole("option", { name: /Rina/ }).click();
  await page.getByRole("button", { name: new RegExp(pc("serviceLabel")) }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
  if (mode === "BOOKED") {
    await page.getByRole("button", { name: pc("addSession") }).click();
    const dialog = page
      .getByRole("dialog", { name: pc("sessionDialogTitle") })
      .filter({ visible: true });
    await dialog.getByRole("textbox", { name: pc("sessionName") }).fill("Wisuda");
    await dialog.getByRole("button", { name: new RegExp(pc("sessionDate")) }).click();
    await page.getByRole("grid").getByText("15", { exact: true }).first().click();
    await dialog.getByRole("button", { name: pc("sessionSave") }).click();
    // The first save compiles the action in dev.
    await expect(dialog).toBeHidden({ timeout: 30_000 });
  }
  const submit = mode === "BOOKED" ? pc("create") : pc("saveDraft");
  await page.getByRole("button", { name: submit }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=/, { timeout: 30_000 });
  return new URL(page.url()).pathname;
}
