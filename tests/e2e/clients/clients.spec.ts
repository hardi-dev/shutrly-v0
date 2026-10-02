import { expect, test } from "@playwright/test";

import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

test("AC-CLI-001 AC-CLI-002 AC-CLI-003 adds a client from an empty list", async ({ page }) => {
  await registerAndVerify(page, uniqueEmail("clients"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Clients Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);

  const workspaceId = new URL(page.url()).pathname.split("/")[2];
  await page.goto(`/w/${workspaceId}/clients`);
  await expect(page.getByRole("heading", { name: CLIENT_COPY.emptyActiveTitle })).toBeVisible();

  await page.goto(`/w/${workspaceId}/clients/archived`);
  await expect(page.getByRole("heading", { name: CLIENT_COPY.emptyArchivedTitle })).toBeVisible();

  await page.goto(`/w/${workspaceId}/clients`);
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Rina Wedding");
  await dialog.getByRole("textbox", { name: CLIENT_COPY.whatsappNumber }).fill("0812-3456-7890");
  await dialog.getByRole("button", { name: CLIENT_COPY.save }).click();

  await expect(dialog).toBeHidden();
  const clientsMain = page.getByRole("main", { name: "Klien" });
  const clientTable = page.getByRole("grid", { name: CLIENT_COPY.listTitle });
  await expect(clientTable.getByText("+62 812-3456-7890")).toBeVisible();
  await expect(clientsMain.getByText("1 klien aktif")).toBeVisible();
  await page.reload();
  await expect(clientTable.getByText("+62 812-3456-7890")).toBeVisible();
});
