import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { DASHBOARD_COPY } from "@/features/workspace/ui/dashboard-screen/dashboard-screen.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { SETUP_CHECKLIST_COPY } from "@/features/workspace/ui/setup-checklist/setup-checklist.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(120_000);
test.describe.configure({ retries: 1 });

const copy = SETUP_CHECKLIST_COPY.messages.en;
const catalog = CATALOG_COPY.messages.en;
const progress = (done: number) =>
  copy.progress.replace("{done}", String(done)).replace("{total}", "4");

function checklist(page: Page) {
  return page.getByRole("region", { name: copy.title }).filter({ visible: true }).first();
}

function visibleDialog(page: Page, name: string) {
  return page.getByRole("dialog", { name }).filter({ visible: true }).first();
}

async function createWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("setup-checklist"), "en");
  await page.getByLabel(ONBOARDING_COPY.messages.en.nameLabel).fill("Checklist Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.en.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function addServiceInOpenDialog(page: Page): Promise<void> {
  const serviceDialog = visibleDialog(page, catalog.addServiceTitle);
  await expect(serviceDialog).toBeVisible();
  await serviceDialog.getByRole("button", { name: catalog.addCategoryInline }).click();
  const categoryDialog = visibleDialog(page, catalog.categoryDialogAddTitle);
  await categoryDialog.getByRole("textbox", { name: catalog.nameCategory }).fill("Wedding");
  await categoryDialog.getByRole("button", { name: catalog.save }).click();
  await expect(categoryDialog).toBeHidden();
  await serviceDialog.getByRole("textbox", { name: catalog.nameService }).fill("Wedding Basic");
  await serviceDialog.getByRole("textbox", { name: catalog.basePrice }).fill("750000");
  await serviceDialog.getByRole("button", { name: catalog.save }).click();
  await expect(page).toHaveURL(/\/services\/[0-9a-f-]+$/);
}

test("AC-SETUP-001 AC-SETUP-005 AC-SETUP-006 AC-SETUP-016 a new owner follows the setup checklist", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const workspaceId = await createWorkspace(page);

  // AC-SETUP-001: the checklist replaces the branding prompt; step 1 holds the only button.
  const card = checklist(page);
  await expect(card).toBeVisible();
  await expect(card.getByText(progress(0))).toBeVisible();
  await expect(card.getByRole("link")).toHaveCount(2);
  await expect(card.getByRole("link", { name: copy.serviceAction })).toBeVisible();
  await expect(card.getByRole("link", { name: copy.brandNameTitle })).toBeVisible();
  await expect(card.getByText(copy.lockedHint)).toHaveCount(2);
  await expect(page.getByRole("link", { name: DASHBOARD_COPY.messages.en.settings })).toHaveCount(
    0,
  );

  // AC-SETUP-016: New project without a service explains it and leads to Add service.
  await page.goto(`/w/${workspaceId}/projects/new`);
  const project = PROJECT_COPY.messages.en;
  await expect(page.getByText(project.noServiceBody).filter({ visible: true })).toBeVisible();
  await page
    .getByRole("button", { name: project.noServiceAction })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/services\?add=service$/);
  await expect(visibleDialog(page, catalog.addServiceTitle)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/services$/);

  // AC-SETUP-005: step 1 opens Services with Add service open; saving opens the service (F-05).
  await page.goto(`/w/${workspaceId}`);
  await checklist(page).getByRole("link", { name: copy.serviceAction }).click();
  await expect(page).toHaveURL(/\/services\?add=service$/);
  await addServiceInOpenDialog(page);

  // AC-SETUP-006: step 1 is done, step 2 holds the only button, step 3 is a row link.
  await page.goto(`/w/${workspaceId}`);
  const after = checklist(page);
  await expect(after.getByText(progress(1))).toBeVisible();
  await expect(after.getByText(copy.done, { exact: true })).toBeVisible();
  await expect(after.getByRole("link", { name: copy.serviceAction })).toHaveCount(0);
  await expect(after.getByRole("link", { name: copy.packageItemsAction })).toHaveAttribute(
    "href",
    /\/services\/[0-9a-f-]+$/,
  );
  await expect(after.getByRole("link", { name: copy.firstProjectTitle })).toHaveAttribute(
    "href",
    `/w/${workspaceId}/projects/new`,
  );
});
