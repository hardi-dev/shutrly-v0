import { type Browser, expect, type Locator, type Page, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { ADD_ON_COPY } from "@/features/booking/ui/add-on-copy/add-on.copy";
import { PROJECT_COPY_NAMESPACE } from "@/features/booking/ui/project-copy/project-copy.copy";
import { CLIENT_COPY_NAMESPACE } from "@/features/gallery/ui/client-copy/client-copy.copy";
import { CLIENT_HOME_COPY_NAMESPACE } from "@/features/gallery/ui/client-home-screen/client-home-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { DELIVERY_COPY_NAMESPACE } from "@/features/gallery/ui/delivery-copy/delivery.copy";
import { DELIVERY_SCREEN_COPY_NAMESPACE } from "@/features/gallery/ui/delivery-screen/delivery-screen.copy";
import { GALLERY_COPY_NAMESPACE } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { PICK_NOTE_COPY_NAMESPACE } from "@/features/gallery/ui/pick-note-sheet/pick-note-sheet.copy";
import { PICK_COPY_NAMESPACE } from "@/features/gallery/ui/pick-screen/pick-screen.copy";
import { SELECTION_OWNER_COPY_NAMESPACE } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";

import {
  createProject,
  expectGalleryA11y,
  openGalleryWorkspace,
  visibleText,
} from "../gallery/gallery-e2e";
import { clientToken, GALLERY_PASSWORD, linkFolder, setGalleryPassword } from "./client-access-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");
const clientCopy = copyTranslator(CLIENT_COPY_NAMESPACE, "id");
const homeCopy = copyTranslator(CLIENT_HOME_COPY_NAMESPACE, "id");
const passwordCopy = copyTranslator(CLIENT_PASSWORD_FORM_COPY_NAMESPACE, "id");
const pickCopy = copyTranslator(PICK_COPY_NAMESPACE, "id");
const pickNoteCopy = copyTranslator(PICK_NOTE_COPY_NAMESPACE, "id");
const deliveryCopy = copyTranslator(DELIVERY_COPY_NAMESPACE, "id");
const selectionCopy = copyTranslator(SELECTION_OWNER_COPY_NAMESPACE, "id");
const deliveryScreenCopy = copyTranslator(DELIVERY_SCREEN_COPY_NAMESPACE, "id");

const pc = copyTranslator(PROJECT_COPY_NAMESPACE, "id");

// Needs the dev server with E2E_FAKE_DRIVE=1: the fixture folder has 4 proofs at the root and an
// *Edited* subfolder (3 files) that the Owner maps to *Foto edit* (F-21).
test.setTimeout(420_000);
// The shared setup helpers have short waits that a cold dev server can miss (as gallery-sync.spec).
test.describe.configure({ retries: 2 });

const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";
const PHONE = { width: 390, height: 844 };

/** The Owner's booked project with *Foto edit* (3 photos, notes on) and its fixture gallery, synced. The gallery exists from the booking; there is no publish (F-27). */
// The saves below go to the remote database and refresh the page, which can pass the 5 s default.
async function ownerProject(page: Page): Promise<string> {
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await page
    .getByRole("button", { name: pc("addItemDesktop") })
    .first()
    .click();
  const item = page.getByRole("dialog", { name: pc("itemAddTitle") }).filter({ visible: true });
  await item.getByRole("button", { name: new RegExp(pc("itemPickerLabel")) }).click();
  await page.getByRole("option", { name: /Foto edit/ }).click();
  await item.getByRole("textbox", { name: pc("quantityLabel") }).fill("3");
  await item.getByRole("button", { name: pc("itemAddConfirm") }).click();
  await expect(item).toBeHidden({ timeout: 20_000 });
  await linkFolder(page, projectPath, RINA);
  await setGalleryPassword(page, GALLERY_PASSWORD);
  await mapEditedFolder(page);
  return projectPath;
}

/** F-21: *Edit folder* maps the fixture's *Edited* subfolder to the package item *Foto edit*. */
async function mapEditedFolder(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: galleryCopy("sourceMenu", { name: "Rina-Wisuda" }) })
    .click();
  await page.getByRole("menuitem", { name: galleryCopy("renameFolder") }).click();
  const edit = page.getByRole("dialog", { name: galleryCopy("renameDialogTitle") });
  await edit.getByRole("button", { name: /Foto edit/ }).click();
  // The option is the Drive subfolder's own name, which is never translated.
  await page.getByRole("option", { name: "Edited", exact: true }).click();
  await edit.getByRole("button", { name: galleryCopy("save") }).click();
  await expect(edit).toBeHidden({ timeout: 20_000 });
  await expect(visibleText(page, "5 foto pilihan · 3 hasil akhir")).toBeVisible();
}

async function signIn(browser: Browser, clientPath: string, viewport?: typeof PHONE) {
  const context = await browser.newContext(viewport ? { viewport } : {});
  const client = await context.newPage();
  const field = client.locator('input[name="password"]');
  // The sync can finish a moment before the client route reads the gallery, so retry the first load.
  await expect(async () => {
    await client.goto(clientPath);
    await expect(field).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await field.fill(GALLERY_PASSWORD);
  await client.getByRole("button", { name: passwordCopy("submit") }).click();
  await expect(client).toHaveURL(clientPath);
  return { context, client };
}

/** Picks a proof on the open Pilih screen. */
async function pick(client: Page, fileName: string): Promise<void> {
  await client.getByRole("button", { name: fileName, pressed: false }).click();
  await expect(client.getByRole("button", { name: fileName, pressed: true })).toBeVisible();
}

/** Tinjau, then *Kirim* and the below-limit confirm; the group stays open for the places left (Owner 2026-10-07). */
async function send(client: Page): Promise<void> {
  await client
    .getByRole("link", { name: pickCopy("review") })
    .first()
    .click();
  await expectGalleryA11y(client);
  await client
    .getByRole("button", { name: /^Kirim/ })
    .filter({ visible: true })
    .first()
    .click();
  const confirm = client.getByRole("dialog").filter({ visible: true });
  await confirm.getByRole("button", { name: /^Kirim/ }).click();
  await expect(client).toHaveURL(/\/g\/[^/]+$/);
  await expect(visibleText(client, clientCopy("groupStatusOpen"))).toBeVisible();
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

test("J-04 J-05 J-06 AC-ACC-014 AC-GFL-017 AC-GFL-019 the client journeys with axe at desktop and phone widths", async ({
  page,
  browser,
}) => {
  const projectPath = await ownerProject(page);
  const clientPath = `/g/${await clientToken(projectPath.split("/").at(-1) ?? "")}`;
  const { context, client } = await signIn(browser, clientPath);
  try {
    // J-04: Beranda, Pilih with a note, Tinjau, Kirim; the Owner locks later.
    await expectGalleryA11y(client);
    await client
      .getByRole("link", { name: homeCopy("actionStart") })
      .first()
      .click();
    await expectGalleryA11y(client);
    await pick(client, "IMG_001.jpg");
    await client
      .getByRole("button", { name: pickCopy("noteAdd", { fileName: "IMG_001.jpg" }) })
      .click();
    const note = client.getByRole("dialog").filter({ visible: true });
    await note
      .getByRole("textbox", { name: pickNoteCopy("label") })
      .fill("Tolong cerahkan sedikit");
    await note.getByRole("button", { name: pickNoteCopy("save") }).click();
    await expect(note).toBeHidden();
    await send(client);

    // J-05: an approved add-on reopens the sent group; the client picks one more and sends again.
    await page.goto(projectPath);
    await page.getByRole("button", { name: ADD_ON_COPY.messages.id.add }).first().click();
    const form = page
      .getByRole("dialog", { name: ADD_ON_COPY.messages.id.formTitle })
      .filter({ visible: true });
    await form
      .getByRole("textbox", { name: ADD_ON_COPY.messages.id.descriptionLabel })
      .fill("Tambahan 2 foto edit");
    await form.getByRole("textbox", { name: ADD_ON_COPY.messages.id.quantityLabel }).fill("2");
    await form.getByRole("textbox", { name: ADD_ON_COPY.messages.id.priceLabel }).fill("20000");
    await form.getByRole("button", { name: ADD_ON_COPY.messages.id.saveDraft }).click();
    await expect(form).toBeHidden();
    await page
      .getByRole("button", {
        name: copyTranslator("bookingAddOn")("actionsLabel", {
          description: "Tambahan 2 foto edit",
        }),
      })
      .click();
    await page.getByRole("menuitem", { name: ADD_ON_COPY.messages.id.approve }).click();
    await confirmIn(page, ADD_ON_COPY.messages.id.approveConfirm);
    await expect(visibleText(page, ADD_ON_COPY.messages.id.statusApproved)).toBeVisible();
    await client.goto(clientPath);
    await expect(visibleText(client, "1 dari 5 foto dipilih")).toBeVisible();
    await client
      .getByRole("link", { name: homeCopy("actionContinue") })
      .first()
      .click();
    await pick(client, "IMG_002.jpg");
    await send(client);

    // J-04 end: the Owner opens the picks from the gallery page (A-34) and locks the sent group.
    expect((await page.request.get(`${projectPath}/pilihan`)).status()).toBe(404);
    // Indonesian route segments were renamed with no redirect (Owner 2026-10-07).
    expect((await page.request.get(`${projectPath}/gallery/pilihan`)).status()).toBe(404);
    await page.goto(`${projectPath}/gallery`);
    // Sent below the limit, so the card offers Lihat pilihan and the group Kunci pilihan (AC-SEL-011).
    // A click before the page hydrates is dropped, so click again until the picks page opens.
    const viewPicks = page.getByRole("link", { name: selectionCopy("viewPicks") }).first();
    await expect(async () => {
      await viewPicks.click();
      await expect(page).toHaveURL(`${projectPath}/gallery/picks`, { timeout: 5_000 });
    }).toPass({ timeout: 45_000 });
    const lock = page.getByRole("button", { name: selectionCopy("lockPicks") }).first();
    await openAndConfirm(page, lock, selectionCopy("lockPicks"));
    await expect(visibleText(page, selectionCopy("statusLocked"))).toBeVisible();

    // AC-GFL-019: the synced finished files are visible to the client before delivery, while the
    // project is still BOOKED.
    await client.goto(`${clientPath}/final`);
    await expectGalleryA11y(client);
    await expect(client.getByRole("link", { name: /^Unduh E_/ }).first()).toBeVisible();

    // J-06: the Owner marks the project delivered (Tandai terkirim, AC-GFL-017; the ⋯ menu of a
    // BOOKED project); the client downloads one file and then all.
    await page.goto(projectPath);
    await page
      .getByRole("button", { name: pc("menuActions", { name: "Wisuda Basic — Rina" }) })
      .click();
    await page.getByRole("menuitem", { name: pc("menuMarkDelivered") }).click();
    await confirmIn(page, deliveryCopy("completeConfirm"));
    await expect(visibleText(page, deliveryCopy("completedToast"))).toBeVisible();
    expect((await client.request.get(`${clientPath}/hasil-akhir`)).status()).toBe(404);
    await client.goto(`${clientPath}/final`);
    await expectGalleryA11y(client);
    const one = client.waitForEvent("download");
    await client
      .getByRole("link", { name: /^Unduh E_/ })
      .first()
      .click();
    expect((await one).suggestedFilename()).toMatch(/^E_.+\.jpg$/);
    await expect(async () => {
      await client
        .getByRole("button", { name: deliveryScreenCopy("download") })
        .first()
        .click();
      await expect(client.getByRole("menuitem", { name: /^Unduh semua/ })).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 30_000 });
    await client.getByRole("menuitem", { name: /^Unduh semua/ }).click();
    await confirmIn(client, deliveryScreenCopy("confirm"));
    await expect(visibleText(client, deliveryScreenCopy("readyTitle"))).toBeVisible({
      timeout: 30_000,
    });
    await expectGalleryA11y(client);

    // J-06 end: Tandai selesai, the project header's action on a delivered project (A-34).
    await page.goto(projectPath);
    await expect(visibleText(page, deliveryCopy("headerMeta", { when: "" }).trim())).toBeVisible();
    const finish = page.getByRole("button", { name: deliveryCopy("finish") }).first();
    await openAndConfirm(page, finish, deliveryCopy("finish"));
    await expect(visibleText(page, deliveryCopy("finishedToast"))).toBeVisible();

    // AC-ACC-014 on a phone: Beranda, Semua foto and Hasil akhir.
    const phone = await signIn(browser, clientPath, PHONE);
    try {
      for (const path of ["", "/photos", "/final"]) {
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
