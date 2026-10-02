import { expect, test } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

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
