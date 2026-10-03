import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectProjectsA11y(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(axeTags)
    .exclude('[role="log"][aria-relevant="additions"]')
    .analyze();
  expect(results.violations).toEqual([]);
}

function visibleText(page: Page, text: string) {
  return page.getByText(text).filter({ visible: true }).first();
}

async function openWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("projects"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Projects Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function addClient(page: Page, workspaceId: string, name: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill(name);
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

async function pickClientAndService(page: Page): Promise<void> {
  await page.getByRole("combobox", { name: PROJECT_COPY.clientLabel }).click();
  await page.getByRole("option", { name: /Rina/ }).click();
  await page.getByRole("button", { name: new RegExp(PROJECT_COPY.serviceLabel) }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
}

async function addSession(page: Page): Promise<void> {
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

test("AC-PRJ-006 AC-PRJ-007 AC-PRJ-008 AC-PRJ-009 creates a booked project from a client, a service and a session", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);

  await page.goto(`/w/${workspaceId}/projects/new`);
  await expect(
    page.getByRole("heading", { level: 1, name: PROJECT_COPY.createTitle }).first(),
  ).toBeVisible();
  await expectProjectsA11y(page);

  await pickClientAndService(page);
  await expect(page.getByRole("textbox", { name: PROJECT_COPY.titleLabel })).toHaveValue(
    "Wisuda Basic — Rina",
  );
  await expect(page.getByRole("textbox", { name: PROJECT_COPY.priceLabel })).toHaveValue("750.000");

  await page.getByRole("button", { name: PROJECT_COPY.create }).click();
  await expect(page.getByText("Tambahkan minimal satu sesi.")).toBeVisible();

  await addSession(page);
  await expectProjectsA11y(page);
  await page.getByRole("button", { name: PROJECT_COPY.create }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=created$/);
  await expect(page.getByText(PROJECT_COPY.toastCreatedTitle)).toBeVisible();

  await expect(
    page.getByRole("heading", { level: 1, name: "Wisuda Basic — Rina" }).first(),
  ).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusBooked)).toBeVisible();
  await expect(visibleText(page, "Rina · +62 812-3456-7890")).toBeVisible();
  await expect(visibleText(page, "Rp 750.000")).toBeVisible();
  await expectProjectsA11y(page);

  await page.getByRole("button", { name: PROJECT_COPY.stepStart }).click();
  await expect(visibleText(page, PROJECT_COPY.toastStartedTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusShooting)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.lockedDescription)).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.stepFinish }).click();
  await expect(visibleText(page, PROJECT_COPY.toastFinishedTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusPostProcessing)).toBeVisible();
  await expect(page.getByRole("button", { name: PROJECT_COPY.stepFinish })).toHaveCount(0);
  await expect(page.getByRole("button", { name: PROJECT_COPY.stepStart })).toHaveCount(0);
});

test("AC-PRJ-029 saves a draft without a session", async ({ page }) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);

  await page.goto(`/w/${workspaceId}/projects/new`);
  await pickClientAndService(page);
  await page.getByRole("button", { name: PROJECT_COPY.saveDraft }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=draft-saved$/);
  await expect(visibleText(page, PROJECT_COPY.toastDraftSavedTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusDraft)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.scheduleEmptyTitle)).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.stepConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.toastSessionRequiredTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusDraft)).toBeVisible();
});
