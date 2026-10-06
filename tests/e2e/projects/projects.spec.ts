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

async function addClient(
  page: Page,
  workspaceId: string,
  name: string,
  number = "0812-3456-7890",
): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill(name);
  await dialog.getByRole("textbox", { name: CLIENT_COPY.whatsappNumber }).fill(number);
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

async function pickClientAndService(page: Page, client = "Rina"): Promise<void> {
  await page.getByRole("combobox", { name: PROJECT_COPY.clientLabel }).click();
  await page.getByRole("option", { name: new RegExp(client) }).click();
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

async function fillSession(page: Page, name = "Wisuda"): Promise<void> {
  const dialog = page
    .getByRole("dialog", { name: PROJECT_COPY.sessionDialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: PROJECT_COPY.sessionName }).fill(name);
  await dialog.getByRole("button", { name: new RegExp(PROJECT_COPY.sessionDate) }).click();
  await page.getByRole("grid").getByText("15", { exact: true }).first().click();
  await dialog.getByRole("button", { name: PROJECT_COPY.sessionSave }).click();
  await expect(dialog).toBeHidden();
}

async function createProject(
  page: Page,
  workspaceId: string,
  options: { client?: string; withSession: boolean; mode: "DRAFT" | "BOOKED" },
): Promise<string> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await pickClientAndService(page, options.client);
  if (options.withSession) await addSession(page);
  await page
    .getByRole("button", {
      name: options.mode === "BOOKED" ? PROJECT_COPY.create : PROJECT_COPY.saveDraft,
    })
    .click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=/);
  return new URL(page.url()).pathname;
}

async function addItem(page: Page, item: string, amount: string): Promise<void> {
  await page.getByRole("button", { name: PROJECT_COPY.addItemDesktop }).click();
  const dialog = page
    .getByRole("dialog", { name: PROJECT_COPY.itemAddTitle })
    .filter({ visible: true });
  await dialog.getByRole("button", { name: /^Item/ }).click();
  await page.getByRole("option", { name: new RegExp(item) }).click();
  await dialog.getByRole("textbox", { name: PROJECT_COPY.quantityLabel }).fill(amount);
  await dialog.getByRole("button", { name: PROJECT_COPY.itemAddConfirm }).click();
  await expect(dialog).toBeHidden();
}

test("AC-PRJ-013 AC-PRJ-008 AC-PRJ-030 creates a client inline, edits the package and books it", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addService(page, workspaceId);

  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: PROJECT_COPY.clientLabel }).fill("Sar");
  await page.getByRole("option", { name: /Tambah klien baru “Sar”/ }).click();
  const clientDialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await expect(clientDialog.getByRole("textbox", { name: CLIENT_COPY.name })).toHaveValue("Sar");
  await clientDialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Sari");
  await clientDialog
    .getByRole("textbox", { name: CLIENT_COPY.whatsappNumber })
    .fill("0812 3456 7891");
  await clientDialog.getByRole("button", { name: CLIENT_COPY.save }).click();
  await expect(clientDialog).toBeHidden();
  // The picker takes focus back and reopens its list; close it before using the rest of the form.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("combobox", { name: PROJECT_COPY.clientLabel })).toHaveValue("Sari");
  await expect(page.getByText("+62 812-3456-7891")).toBeVisible();

  await page.getByRole("button", { name: /^Layanan/ }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
  await expect(page.getByRole("textbox", { name: PROJECT_COPY.titleLabel })).toHaveValue(
    "Wisuda Basic — Sari",
  );

  await addItem(page, "Foto edit", "30");
  await addItem(page, "Foto cetak", "10");
  await expect(page.getByText("30 foto · hitung foto")).toBeVisible();
  await expectProjectsA11y(page);

  await addSession(page);
  await page.getByRole("button", { name: PROJECT_COPY.create }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=created$/);
  await expect(visibleText(page, "30 foto · hitung foto")).toBeVisible();
  await expect(visibleText(page, "10 lembar · jumlah per foto")).toBeVisible();
});

test("AC-PRJ-009 AC-PRJ-029 a draft without a session asks for one, then books", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);
  await createProject(page, workspaceId, { withSession: false, mode: "DRAFT" });

  await page.getByRole("button", { name: PROJECT_COPY.stepConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.toastSessionRequiredTitle)).toBeVisible();
  await fillSession(page);
  await expect(visibleText(page, PROJECT_COPY.editSavedToast)).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.stepConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.toastConfirmedTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusBooked)).toBeVisible();
});

test("AC-PRJ-001 AC-PRJ-004 AC-PRJ-027 AC-PRJ-028 lists, searches, filters and steps from a row", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina", "0812-3456-7890");
  await addClient(page, workspaceId, "Budi", "0812-3456-7899");
  await addService(page, workspaceId);
  await createProject(page, workspaceId, { client: "Rina", withSession: true, mode: "BOOKED" });
  await createProject(page, workspaceId, { client: "Budi", withSession: false, mode: "DRAFT" });

  await page.goto(`/w/${workspaceId}/projects`);
  await expect(page.getByRole("link", { name: "Wisuda Basic — Rina" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wisuda Basic — Budi" })).toBeVisible();
  await expect(visibleText(page, "2 proyek aktif")).toBeVisible();
  await expectProjectsA11y(page);

  await page.getByRole("searchbox", { name: PROJECT_COPY.searchLabel }).fill("Rina");
  await expect(page).toHaveURL(/q=Rina/);
  await expect(page.getByRole("link", { name: "Wisuda Basic — Budi" })).toBeHidden();
  await page.reload();
  await expect(page.getByRole("searchbox", { name: PROJECT_COPY.searchLabel })).toHaveValue("Rina");
  await page.getByRole("button", { name: PROJECT_COPY.clearSearch }).click();
  await expect(page.getByRole("link", { name: "Wisuda Basic — Budi" })).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.filterButton }).click();
  const filter = page.getByRole("dialog", { name: PROJECT_COPY.filterTitle });
  await expectProjectsA11y(page);
  await filter.getByRole("button", { name: /^Status/ }).click();
  await page.getByRole("option", { name: PROJECT_COPY.statusDraft }).click();
  await page.keyboard.press("Escape");
  await filter.getByRole("button", { name: PROJECT_COPY.filterApply }).click();
  await expect(page).toHaveURL(/status=DRAFT/);
  await expect(page.getByRole("button", { name: "Filter, 1 aktif" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wisuda Basic — Rina" })).toBeHidden();
  await page.reload();
  await expect(page.getByRole("button", { name: "Filter, 1 aktif" })).toBeVisible();
  await page.getByRole("button", { name: "Filter, 1 aktif" }).click();
  await page.getByRole("button", { name: PROJECT_COPY.filterReset }).click();
  await expect(page.getByRole("link", { name: "Wisuda Basic — Rina" })).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.menuActions("Wisuda Basic — Rina") }).click();
  await expectProjectsA11y(page);
  await expect(page.getByRole("menuitem", { name: PROJECT_COPY.menuChat })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/62/,
  );
  await page.getByRole("menuitem", { name: PROJECT_COPY.stepStart }).click();
  await expect(visibleText(page, PROJECT_COPY.toastStartedTitle)).toBeVisible();
  await expect(visibleText(page, PROJECT_COPY.statusShooting)).toBeVisible();
});

test("AC-PRJ-018 AC-PRJ-020 AC-PRJ-022 AC-PRJ-023 locks the deal, cancels with a reason and deletes a draft", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);
  const booked = await createProject(page, workspaceId, { withSession: true, mode: "BOOKED" });
  await expect(page.getByRole("button", { name: PROJECT_COPY.addItemDesktop })).toBeVisible();

  await page.getByRole("button", { name: PROJECT_COPY.stepStart }).click();
  await expect(visibleText(page, PROJECT_COPY.statusShooting)).toBeVisible();
  await expect(page.getByRole("button", { name: PROJECT_COPY.addItemDesktop })).toHaveCount(0);
  await page.getByRole("button", { name: PROJECT_COPY.infoEditDesktop }).click();
  await expect(page.getByRole("textbox", { name: PROJECT_COPY.priceLabel })).toBeDisabled();
  await expectProjectsA11y(page);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: PROJECT_COPY.menuActions("Wisuda Basic — Rina") }).click();
  await page.getByRole("menuitem", { name: PROJECT_COPY.menuCancel }).click();
  const cancel = page.getByRole("dialog", { name: PROJECT_COPY.cancelDialogTitle });
  await cancel.getByRole("button", { name: PROJECT_COPY.cancelConfirm }).click();
  await expect(
    cancel.getByText("Isi alasan pembatalan. Wajib setelah pemotretan dimulai."),
  ).toBeVisible();
  await cancel.getByRole("textbox").fill("wisuda diundur");
  await cancel.getByRole("button", { name: PROJECT_COPY.cancelConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.cancelledTitle)).toBeVisible();
  await expect(visibleText(page, "Alasan: wisuda diundur.")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(booked));

  await createProject(page, workspaceId, { withSession: false, mode: "DRAFT" });
  await page.getByRole("button", { name: PROJECT_COPY.menuActions("Wisuda Basic — Rina") }).click();
  await page.getByRole("menuitem", { name: PROJECT_COPY.menuDeleteDraft }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: PROJECT_COPY.deleteConfirm })
    .click();
  await expect(page).toHaveURL(new RegExp(`/w/${workspaceId}/projects$`));
  await expect(visibleText(page, PROJECT_COPY.toastDeletedTitle)).toBeVisible();
});

test("AC-PRJ-025 another account cannot open a project", async ({ page, browser }) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);
  const projectPath = await createProject(page, workspaceId, { withSession: true, mode: "BOOKED" });

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await openWorkspace(otherPage);
  const response = await otherPage.goto(projectPath);
  expect(response?.status()).toBe(404);
  await other.close();
});

test("AC-PRJ-026 the list, form and detail pass axe on a phone and in dark mode", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId, "Rina");
  await addService(page, workspaceId);
  const detail = await createProject(page, workspaceId, {
    withSession: true,
    mode: "BOOKED",
  });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ["light", "dark"] as const) {
      for (const path of [`/w/${workspaceId}/projects`, `/w/${workspaceId}/projects/new`, detail]) {
        await page.goto(path);
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await expectProjectsA11y(page);
      }
    }
  }
});
