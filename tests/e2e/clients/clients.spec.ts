import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, label: string): Promise<string> {
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Clients Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function openClients(page: Page, workspaceId: string, archived = false): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients${archived ? "/archived" : ""}`);
  await expect(page).toHaveURL(
    new RegExp(`/w/${workspaceId}/clients${archived ? "/archived" : ""}(?:\\?.*)?$`),
  );
}

async function addClient(
  page: Page,
  values: Readonly<{ name: string; whatsappNumber?: string; instagram?: string; tiktok?: string }>,
): Promise<void> {
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill(values.name);
  if (values.whatsappNumber)
    await dialog
      .getByRole("textbox", { name: CLIENT_COPY.whatsappNumber })
      .fill(values.whatsappNumber);
  if (values.instagram)
    await dialog
      .getByRole("textbox", { name: CLIENT_COPY.socialValueField("Instagram", 1) })
      .fill(values.instagram);
  if (values.tiktok) {
    await dialog.getByRole("button", { name: CLIENT_COPY.addSocialLink }).click();
    await dialog.getByRole("button", { name: CLIENT_COPY.socialPlatformField(2) }).click();
    await page.getByRole("option", { name: "TikTok" }).click();
    await dialog
      .getByRole("textbox", { name: CLIENT_COPY.socialValueField("TikTok", 2) })
      .fill(values.tiktok);
  }
  await dialog.getByRole("button", { name: CLIENT_COPY.save }).click();
  await expect(dialog).toBeHidden();
}

async function openActions(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: CLIENT_COPY.rowActions(name) }).click();
}

test("AC-CLI-001 AC-CLI-003 navigates a new workspace to both empty client tabs", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page, "clients-empty");

  await openClients(page, workspaceId);
  await expect(page.getByRole("link", { name: OWNER_NAV_COPY.clients }).first()).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("heading", { name: CLIENT_COPY.emptyActiveTitle })).toBeVisible();

  await openClients(page, workspaceId, true);
  await expect(page.getByRole("heading", { name: CLIENT_COPY.emptyArchivedTitle })).toBeVisible();
});

test("AC-CLI-006 AC-CLI-010 AC-CLI-012 AC-CLI-021 adds a client, reports a taken number, and edits it", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page, "clients-add-edit");
  await openClients(page, workspaceId);

  await addClient(page, {
    name: "Rina Wedding",
    whatsappNumber: "0812-3456-7890",
    instagram: "@rina.wed",
    tiktok: "https://www.tiktok.com/@rina",
  });

  const clientsMain = page.getByRole("main", { name: "Klien" });
  const clientTable = page.getByRole("grid", { name: CLIENT_COPY.listTitle });
  await expect(clientTable.getByText("+62 812-3456-7890")).toBeVisible();
  await expect(clientsMain.getByText("1 klien aktif")).toBeVisible();
  await expect(clientTable.getByText("Instagram · @rina.wed")).toBeVisible();
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

test("AC-CLI-013 AC-CLI-014 AC-CLI-021 archives, restores, and deletes a client", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page, "clients-lifecycle");
  await openClients(page, workspaceId);
  await addClient(page, { name: "Rina Wedding", whatsappNumber: "0812-3456-7890" });

  await openActions(page, "Rina Wedding");
  await page.getByRole("menuitem", { name: CLIENT_COPY.archive }).click();
  await expect(page.getByText(CLIENT_COPY.archivedTitle)).toBeVisible();
  await expect(page.getByRole("main", { name: "Klien" }).getByText("0 klien aktif")).toBeVisible();
  await page.getByRole("button", { name: CLIENT_COPY.undo }).click();
  await expect(page.getByRole("main", { name: "Klien" }).getByText("1 klien aktif")).toBeVisible();

  await openActions(page, "Rina Wedding");
  await page.getByRole("menuitem", { name: CLIENT_COPY.archive }).click();
  await expect(page.getByRole("main", { name: "Klien" }).getByText("0 klien aktif")).toBeVisible();
  await openClients(page, workspaceId, true);
  await expect(
    page.getByRole("grid", { name: CLIENT_COPY.listTitle }).getByRole("rowheader", {
      name: "Rina Wedding",
    }),
  ).toBeVisible();
  await openActions(page, "Rina Wedding");
  await page.getByRole("menuitem", { name: CLIENT_COPY.restore }).click();
  await expect(page.getByText(CLIENT_COPY.restoredTitle)).toBeVisible();

  await openClients(page, workspaceId);
  await openActions(page, "Rina Wedding");
  await page.getByRole("menuitem", { name: CLIENT_COPY.delete }).click();
  const deleteDialog = page.getByRole("alertdialog", {
    name: CLIENT_COPY.deleteTitle("Rina Wedding"),
  });
  await deleteDialog.getByRole("button", { name: CLIENT_COPY.deleteClient }).click();
  await expect(page.getByText(CLIENT_COPY.deletedTitle)).toBeVisible();
  await expect(page.getByRole("heading", { name: CLIENT_COPY.emptyActiveTitle })).toBeVisible();
});

test("AC-CLI-004 searches, reloads its query, shows no match, and clears it", async ({ page }) => {
  const workspaceId = await openWorkspace(page, "clients-search");
  await openClients(page, workspaceId);
  await addClient(page, { name: "Rina Wedding", whatsappNumber: "0812-3456-7890" });
  await addClient(page, { name: "Budi Foto", whatsappNumber: "0813-4567-8901" });

  const search = page.getByRole("searchbox", { name: CLIENT_COPY.searchLabel });
  await search.fill("RIN");
  await expect(page).toHaveURL(/\?q=RIN$/);
  const clientTable = page.getByRole("grid", { name: CLIENT_COPY.listTitle });
  await expect(clientTable.getByRole("rowheader", { name: "Rina Wedding" })).toBeVisible();
  await expect(clientTable.getByRole("rowheader", { name: "Budi Foto" })).toHaveCount(0);
  await page.reload();
  await expect(search).toHaveValue("RIN");

  await search.fill("zzz");
  await expect(page.getByRole("heading", { name: CLIENT_COPY.noMatchTitle })).toBeVisible();
  await page.getByRole("button", { name: CLIENT_COPY.clearSearch }).click();
  await expect(page).toHaveURL(new RegExp(`/w/${workspaceId}/clients$`));
  await expect(clientTable.getByRole("rowheader", { name: "Rina Wedding" })).toBeVisible();
});

test("AC-CLI-016 opens WhatsApp with the stored number", async ({ page }) => {
  const workspaceId = await openWorkspace(page, "clients-whatsapp");
  await openClients(page, workspaceId);
  await addClient(page, { name: "Rina Wedding", whatsappNumber: "0812-3456-7890" });

  await openActions(page, "Rina Wedding");
  await expect(page.getByRole("menuitem", { name: CLIENT_COPY.openWhatsapp })).toHaveAttribute(
    "href",
    "https://wa.me/6281234567890",
  );
});

test("AC-CLI-018 prevents a second owner opening another workspace clients", async ({
  browser,
  page,
}) => {
  const workspaceId = await openWorkspace(page, "clients-owner-a");
  const other = await browser.newPage();
  try {
    await openWorkspace(other, "clients-owner-b");
    await other.goto(`/w/${workspaceId}/clients`);
    await expect(
      other.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.title }),
    ).toBeVisible();
  } finally {
    await other.close();
  }
});
