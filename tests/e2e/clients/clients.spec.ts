import { expect, test } from "@playwright/test";

import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

test("AC-CLI-001 AC-CLI-002 AC-CLI-003 AC-CLI-010 AC-CLI-012 adds and edits a client", async ({
  page,
}) => {
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

  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const duplicateDialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await duplicateDialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Budi");
  await duplicateDialog
    .getByRole("textbox", { name: CLIENT_COPY.whatsappNumber })
    .fill("0812 3456 7890");
  await duplicateDialog.getByRole("button", { name: CLIENT_COPY.save }).click();
  await expect(duplicateDialog.getByText("Nomor ini sudah dipakai Rina Wedding")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(duplicateDialog).toBeHidden();
  await clientTable.getByText("Rina Wedding").click();
  const editDialog = page
    .getByRole("dialog", { name: CLIENT_COPY.editDialogTitle })
    .filter({ visible: true });
  await editDialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Rina & Dimas");
  await editDialog.getByRole("button", { name: CLIENT_COPY.saveEdit }).click();
  await expect(editDialog).toBeHidden();
  await expect(clientTable.getByText("Rina & Dimas")).toBeVisible();
});
