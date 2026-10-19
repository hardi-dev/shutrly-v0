import type { Browser, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { GALLERY_SHARE_DIALOG_COPY_NAMESPACE } from "@/features/gallery/ui/gallery-share-dialog/gallery-share-dialog.copy";

import { clientToken } from "../client-access/client-access-e2e";
import { createProject, openGalleryWorkspace } from "../gallery/gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");
const shareCopy = copyTranslator(GALLERY_SHARE_DIALOG_COPY_NAMESPACE, "id");
const passwordCopy = copyTranslator(CLIENT_PASSWORD_FORM_COPY_NAMESPACE, "id");

// Needs the dev server with E2E_FAKE_DRIVE=1 (the fixture Drive tree, no Google). The generated
// password has the shape `word-1234`; the spec reads it from the gallery page and never logs it.
test.setTimeout(180_000);

const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";
const FOLDER_NAME = "Rina-Wisuda";
const PASSWORD_SHAPE = /^[a-z]{4,8}-[2-9]{4}$/;

/** Links the fixture folder from the gallery page; the Drive sync finishes with a *Tersinkron* chip. */
async function linkFixtureFolder(page: Page, projectPath: string): Promise<void> {
  await page
    .getByRole("button", { name: galleryCopy("addFolderCta") })
    .first()
    .click();
  await expect(page).toHaveURL(`${projectPath}/gallery`, { timeout: 30_000 });
  await page
    .getByRole("button", { name: galleryCopy("addFolder") })
    .first()
    .click();
  const link = page.getByRole("dialog", { name: galleryCopy("linkDialogTitle") });
  await link.getByRole("textbox", { name: galleryCopy("linkLabel") }).fill(RINA);
  await link.getByRole("button", { name: galleryCopy("addFolder") }).click();
  // The dialog closes once the folder is linked; the sync then runs on the new source row.
  await expect(link).toBeHidden({ timeout: 90_000 });
  const row = page.getByRole("button", { name: galleryCopy("sourceMenu", { name: FOLDER_NAME }) });
  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByText(galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SUCCEEDED), { exact: true }).first(),
  ).toBeVisible({ timeout: 120_000 });
}

/** Opens the Galeri card's *Kirim link ke klien* and checks the rendered message reached the dialog. */
async function openShareDialog(page: Page, projectPath: string): Promise<void> {
  await page.goto(projectPath);
  const dialog = page.getByRole("dialog", { name: shareCopy("title") });
  const share = page.getByRole("button", { name: galleryCopy("sendLink") }).first();
  // A click before the page hydrates does nothing, so retry until the dialog opens.
  await expect(async () => {
    await share.click();
    await expect(dialog).toBeVisible({ timeout: 5_000 });
  }).toPass({ timeout: 60_000 });
  // The message is loaded on open (AC-GFL-021); the recipient row and the link appear together.
  await expect(dialog.getByText(/\/g\//).first()).toBeVisible({ timeout: 30_000 });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

/** Reads the generated password from the gallery page's access card. */
async function readPassword(page: Page, projectPath: string): Promise<string> {
  await page.goto(`${projectPath}/gallery`);
  const password = page.getByText(PASSWORD_SHAPE).filter({ visible: true }).first();
  await expect(password).toBeVisible();
  return (await password.textContent()) ?? "";
}

/** The client opens the gallery link in a fresh browser context and signs in with the password. */
async function clientOpensGallery(browser: Browser, clientPath: string, password: string) {
  const context = await browser.newContext();
  const client = await context.newPage();
  const field = client.locator('input[name="password"]');
  await expect(async () => {
    await client.goto(clientPath);
    await expect(field).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await field.fill(password);
  await client.getByRole("button", { name: passwordCopy("submit") }).click();
  // The gate and Beranda share the URL, so wait for the gate to go before leaving it.
  await expect(field).toBeHidden({ timeout: 30_000 });
  await expect(client).toHaveURL(clientPath);
  // Beranda lists *Semua foto*; the synced proofs show there (AC-GFL-008).
  await client.goto(`${clientPath}/photos`);
  await expect(client.locator("main img").first()).toBeVisible({ timeout: 60_000 });
  await context.close();
}

test("AC-GFL-001 AC-GFL-007 AC-GFL-008 AC-GFL-013 AC-GFL-020 AC-GFL-021 books a project, links a folder, sends the link and the client opens the gallery", async ({
  page,
  browser,
}) => {
  const workspaceId = await openGalleryWorkspace(page);
  // AC-GFL-001: booking creates the gallery and its password; no Create dialog and no publish step.
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await expect(
    page.getByRole("button", { name: galleryCopy("addFolderCta") }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Publikasikan$/ })).toHaveCount(0);
  await linkFixtureFolder(page, projectPath);
  await openShareDialog(page, projectPath);

  const password = await readPassword(page, projectPath);
  const projectId = projectPath.split("/").at(-1) ?? "";
  const clientPath = `/g/${await clientToken(projectId)}`;
  await clientOpensGallery(browser, clientPath, password);
});
