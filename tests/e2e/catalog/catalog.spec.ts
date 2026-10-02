import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectCatalogA11y(page: Page): Promise<void> {
  // Axe would sample half-faded text while a dialog's entering motion runs.
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(results.violations).toEqual([]);
}

async function createWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("catalog-a11y"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Catalog A11y Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function createServiceForA11y(page: Page, workspaceId: string): Promise<void> {
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
  await categoryDialog.getByRole("textbox", { name: CATALOG_COPY.nameCategory }).fill("A11y");
  await categoryDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(categoryDialog).toBeHidden();
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.nameService }).fill("A11y Service");
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.basePrice }).fill("750000");
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(page).toHaveURL(/\/services\/[0-9a-f-]+$/);
}

test("AC-CAT-003 AC-CAT-004 AC-CAT-009 AC-CAT-010 creates a service from an empty catalog", async ({
  page,
}) => {
  await registerAndVerify(page, uniqueEmail("catalog"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Catalog Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);

  await page.getByRole("link", { name: "Layanan", exact: true }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole("heading", { name: CATALOG_COPY.servicesEmptyTitle, exact: true }).first(),
  ).toBeVisible();

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
  await expect(page.getByRole("heading", { name: "Wisuda Basic" }).first()).toBeVisible();
  await expect(page.getByText(CATALOG_COPY.itemsTitle).first()).toBeVisible();
  await expect(page.getByText(CATALOG_COPY.fieldsTitle).first()).toBeVisible();
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "phone", width: 390, height: 844 },
]) {
  test(`AC-CAT-023 catalog tabs, detail and dialogs have no axe violations at ${viewport.name}`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const workspaceId = await createWorkspace(page);

    for (const path of ["services", "services/categories", "services/items"]) {
      await page.goto(`/w/${workspaceId}/${path}`);
      await expectCatalogA11y(page);
    }

    await page.goto(`/w/${workspaceId}/services/items`);
    const itemActionSheet = page
      .getByRole("dialog", { name: "Foto edit" })
      .filter({ visible: true })
      .first();
    const itemActionButton = page
      .getByRole("button", { name: /^Aksi untuk / })
      .filter({ visible: true })
      .first();
    await itemActionButton.click();
    if (viewport.name === "phone") {
      await page.getByRole("button", { name: CATALOG_COPY.edit, exact: true }).click();
      await expect(itemActionSheet).toBeHidden();
    } else {
      await page.getByRole("menuitem", { name: CATALOG_COPY.edit, exact: true }).click();
    }
    await expect(
      page
        .getByRole("dialog", { name: CATALOG_COPY.definitionDialogEditTitle })
        .filter({ visible: true }),
    ).toBeVisible();
    await expectCatalogA11y(page);
    await page.keyboard.press("Escape");
    await expect(
      page
        .getByRole("dialog", { name: CATALOG_COPY.definitionDialogEditTitle })
        .filter({ visible: true }),
    ).toBeHidden();
    await expect(itemActionButton).toBeFocused();

    await createServiceForA11y(page, workspaceId);
    await page.reload();
    await expectCatalogA11y(page);

    const addItemButton = page
      .getByRole("button", { name: CATALOG_COPY.addItem })
      .filter({ visible: true })
      .first();
    await addItemButton.click();
    await expectCatalogA11y(page);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: CATALOG_COPY.addItemTitle }).filter({ visible: true }),
    ).toBeHidden();

    const addFieldButton = page
      .getByRole("button", { name: CATALOG_COPY.addField })
      .filter({ visible: true })
      .first();
    await addFieldButton.click();
    await expectCatalogA11y(page);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: CATALOG_COPY.addFieldTitle }).filter({ visible: true }),
    ).toBeHidden();
  });
}
