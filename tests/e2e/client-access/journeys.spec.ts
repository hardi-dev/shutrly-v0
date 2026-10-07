import { type Browser, expect, type Locator, type Page, test } from "@playwright/test";

import { ADD_ON_COPY } from "@/features/booking/ui/add-on-copy/add-on.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { CLIENT_HOME_COPY } from "@/features/gallery/ui/client-home-screen/client-home-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { DELIVERY_COPY } from "@/features/gallery/ui/delivery-copy/delivery.copy";
import { DELIVERY_SCREEN_COPY } from "@/features/gallery/ui/delivery-screen/delivery-screen.copy";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { PICK_NOTE_COPY } from "@/features/gallery/ui/pick-note-sheet/pick-note-sheet.copy";
import { PICK_COPY } from "@/features/gallery/ui/pick-screen/pick-screen.copy";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";

import {
  createProject,
  expectGalleryA11y,
  openGalleryWorkspace,
  visibleText,
} from "../gallery/gallery-e2e";
import { clientToken, GALLERY_PASSWORD } from "./client-access-e2e";

// Needs the dev server with E2E_FAKE_DRIVE=1: the fixture folder has 4 proofs, 3 edited, 1 print.
test.setTimeout(420_000);
// The shared setup helpers have short waits that a cold dev server can miss (as gallery-sync.spec).
test.describe.configure({ retries: 2 });

const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";
const PHONE = { width: 390, height: 844 };

/** The Owner's project with *Foto edit* (3 photos, notes on) and a published fixture gallery. */
async function ownerProject(page: Page): Promise<string> {
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await page.getByRole("button", { name: PROJECT_COPY.addItemDesktop }).first().click();
  const item = page
    .getByRole("dialog", { name: PROJECT_COPY.itemAddTitle })
    .filter({ visible: true });
  await item.getByRole("button", { name: new RegExp(PROJECT_COPY.itemPickerLabel) }).click();
  await page.getByRole("option", { name: /Foto edit/ }).click();
  await item.getByRole("textbox", { name: PROJECT_COPY.quantityLabel }).fill("3");
  await item.getByRole("button", { name: PROJECT_COPY.itemAddConfirm }).click();
  await expect(item).toBeHidden();
  await page.getByRole("button", { name: GALLERY_COPY.create }).click();
  const create = page.getByRole("dialog", { name: GALLERY_COPY.createDialogTitle });
  await create.getByRole("textbox", { name: GALLERY_COPY.passwordLabel }).fill(GALLERY_PASSWORD);
  await create.getByRole("button", { name: GALLERY_COPY.create }).click();
  await expect(page).toHaveURL(`${projectPath}/gallery`);
  await page.getByRole("button", { name: GALLERY_COPY.addFolder }).first().click();
  const link = page.getByRole("dialog", { name: GALLERY_COPY.linkDialogTitle });
  await link.getByRole("textbox", { name: GALLERY_COPY.linkLabel }).fill(RINA);
  await link.getByRole("button", { name: GALLERY_COPY.addFolder }).click();
  await expect(visibleText(page, GALLERY_COPY.sourceChip.SUCCEEDED)).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole("button", { name: GALLERY_COPY.publish }).first().click();
  await page
    .getByRole("dialog", { name: GALLERY_COPY.publishDialogTitle })
    .getByRole("button", { name: GALLERY_COPY.publish })
    .click();
  await expect(visibleText(page, GALLERY_COPY.publishedTitle)).toBeVisible();
  return projectPath;
}

async function signIn(browser: Browser, clientPath: string, viewport?: typeof PHONE) {
  const context = await browser.newContext(viewport ? { viewport } : {});
  const client = await context.newPage();
  const field = client.locator('input[name="password"]');
  // The publish toast can show before the gallery row is readable by the next request.
  await expect(async () => {
    await client.goto(clientPath);
    await expect(field).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await field.fill(GALLERY_PASSWORD);
  await client.getByRole("button", { name: CLIENT_PASSWORD_FORM_COPY.submit }).click();
  await expect(client).toHaveURL(clientPath);
  return { context, client };
}

/** Picks a proof on the open Pilih screen. */
async function pick(client: Page, fileName: string): Promise<void> {
  await client.getByRole("button", { name: fileName, pressed: false }).click();
  await expect(client.getByRole("button", { name: fileName, pressed: true })).toBeVisible();
}

/** Tinjau, then *Kirim* and the below-limit confirm. */
async function send(client: Page): Promise<void> {
  await client.getByRole("link", { name: PICK_COPY.review }).first().click();
  await expectGalleryA11y(client);
  await client
    .getByRole("button", { name: /^Kirim/ })
    .filter({ visible: true })
    .first()
    .click();
  const confirm = client.getByRole("dialog").filter({ visible: true });
  await confirm.getByRole("button", { name: /^Kirim/ }).click();
  await expect(visibleText(client, SELECTION_OWNER_COPY.status.SUBMITTED)).toBeVisible();
}

/** Clicks a trigger until its dialog shows (a click before hydration only focuses the button), then confirms. */
async function openAndConfirm(page: Page, trigger: Locator, button: string): Promise<void> {
  const dialog = page.getByRole("dialog").filter({ visible: true });
  await expect(async () => {
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await dialog.getByRole("button", { name: button }).click();
}

async function confirmIn(page: Page, button: string): Promise<void> {
  await page
    .getByRole("dialog")
    .filter({ visible: true })
    .getByRole("button", { name: button })
    .click();
}

test("J-04 J-05 J-06 AC-ACC-014 the client journeys with axe at desktop and phone widths", async ({
  page,
  browser,
}) => {
  const projectPath = await ownerProject(page);
  const clientPath = `/g/${await clientToken(projectPath.split("/").at(-1) ?? "")}`;
  const { context, client } = await signIn(browser, clientPath);
  try {
    // J-04: Beranda, Pilih with a note, Tinjau, Kirim; the Owner locks later.
    await expectGalleryA11y(client);
    await client.getByRole("link", { name: CLIENT_HOME_COPY.actions.START }).first().click();
    await expectGalleryA11y(client);
    await pick(client, "IMG_001.jpg");
    await client.getByRole("button", { name: PICK_COPY.noteAdd("IMG_001.jpg") }).click();
    const note = client.getByRole("dialog").filter({ visible: true });
    await note.getByRole("textbox", { name: PICK_NOTE_COPY.label }).fill("Tolong cerahkan sedikit");
    await note.getByRole("button", { name: PICK_NOTE_COPY.save }).click();
    await expect(note).toBeHidden();
    await send(client);

    // J-05: an approved add-on reopens the sent group; the client picks one more and sends again.
    await page.goto(projectPath);
    await page.getByRole("button", { name: ADD_ON_COPY.add }).first().click();
    const form = page
      .getByRole("dialog", { name: ADD_ON_COPY.formTitle })
      .filter({ visible: true });
    await form
      .getByRole("textbox", { name: ADD_ON_COPY.descriptionLabel })
      .fill("Tambahan 2 foto edit");
    await form.getByRole("textbox", { name: ADD_ON_COPY.quantityLabel }).fill("2");
    await form.getByRole("textbox", { name: ADD_ON_COPY.priceLabel }).fill("20000");
    await form.getByRole("button", { name: ADD_ON_COPY.saveDraft }).click();
    await expect(form).toBeHidden();
    await page
      .getByRole("button", { name: ADD_ON_COPY.actionsLabel("Tambahan 2 foto edit") })
      .click();
    await page.getByRole("menuitem", { name: ADD_ON_COPY.approve }).click();
    await confirmIn(page, ADD_ON_COPY.approveConfirm);
    await expect(visibleText(page, ADD_ON_COPY.status.APPROVED)).toBeVisible();
    await client.goto(clientPath);
    await expect(visibleText(client, "1 dari 5 foto dipilih")).toBeVisible();
    await client.getByRole("link", { name: CLIENT_HOME_COPY.actions.CONTINUE }).first().click();
    await pick(client, "IMG_002.jpg");
    await send(client);

    // J-04 end: the Owner opens the picks from the gallery page (A-34) and locks the sent group.
    expect((await page.request.get(`${projectPath}/pilihan`)).status()).toBe(404);
    await page.goto(`${projectPath}/gallery`);
    await page.getByRole("link", { name: SELECTION_OWNER_COPY.reviewPicks }).first().click();
    await expect(page).toHaveURL(`${projectPath}/gallery/pilihan`);
    const lock = page.getByRole("button", { name: SELECTION_OWNER_COPY.lockPicks }).first();
    await openAndConfirm(page, lock, SELECTION_OWNER_COPY.lockPicks);
    await expect(visibleText(page, SELECTION_OWNER_COPY.status.LOCKED)).toBeVisible();

    // J-06: the Owner publishes final delivery from the gallery page; the client downloads one file and then all.
    await page.goto(`${projectPath}/gallery`);
    const publish = page.getByRole("button", { name: DELIVERY_COPY.publish }).first();
    await openAndConfirm(page, publish, DELIVERY_COPY.publishConfirm);
    await expect(visibleText(page, DELIVERY_COPY.publishedToast)).toBeVisible();
    await client.goto(`${clientPath}/hasil-akhir`);
    await expectGalleryA11y(client);
    const one = client.waitForEvent("download");
    await client
      .getByRole("link", { name: /^Unduh E_/ })
      .first()
      .click();
    expect((await one).suggestedFilename()).toMatch(/^E_.+\.jpg$/);
    await expect(async () => {
      await client.getByRole("button", { name: DELIVERY_SCREEN_COPY.download }).first().click();
      await expect(client.getByRole("menuitem", { name: /^Unduh semua/ })).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 30_000 });
    await client.getByRole("menuitem", { name: /^Unduh semua/ }).click();
    await confirmIn(client, DELIVERY_SCREEN_COPY.confirm);
    await expect(visibleText(client, DELIVERY_SCREEN_COPY.readyTitle)).toBeVisible({
      timeout: 30_000,
    });
    await expectGalleryA11y(client);

    // J-06 end: Tandai selesai, the project header's action on a delivered project (A-34).
    await page.goto(projectPath);
    await expect(visibleText(page, DELIVERY_COPY.headerMeta("").trim())).toBeVisible();
    const complete = page.getByRole("button", { name: DELIVERY_COPY.complete }).first();
    await openAndConfirm(page, complete, DELIVERY_COPY.complete);
    await expect(visibleText(page, DELIVERY_COPY.completedToast)).toBeVisible();

    // AC-ACC-014 on a phone: Beranda, Semua foto and Hasil akhir.
    const phone = await signIn(browser, clientPath, PHONE);
    try {
      for (const path of ["", "/foto", "/hasil-akhir"]) {
        await phone.client.goto(`${clientPath}${path}`);
        await expectGalleryA11y(phone.client);
      }
    } finally {
      await phone.context.close();
    }
  } finally {
    await context.close();
  }
});
