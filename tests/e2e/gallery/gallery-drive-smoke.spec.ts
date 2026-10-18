import type { Browser, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { todayInGalleryZone } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { CLIENT_UNAVAILABLE_COPY_NAMESPACE } from "@/features/gallery/ui/client-unavailable/client-unavailable.copy";
import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
  GALLERY_STATUS_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { clientToken } from "../client-access/client-access-e2e";
import {
  bookGalleryPage,
  expectGalleryA11y,
  openGalleryWorkspace,
  visibleText,
} from "./gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");
const passwordCopy = copyTranslator(CLIENT_PASSWORD_FORM_COPY_NAMESPACE, "id");
const unavailableCopy = copyTranslator(CLIENT_UNAVAILABLE_COPY_NAMESPACE, "id");

// Real-Drive smoke test plus the axe and keyboard pass per surface (plan Slice 8). It needs a
// public folder, so playwright.config.ts runs it only when GALLERY_SMOKE_FOLDER_URL is set; the
// dev server must run without E2E_FAKE_DRIVE.
const FOLDER_URL = process.env.GALLERY_SMOKE_FOLDER_URL ?? "";
const PASSWORD_SHAPE = /^[a-z]{4,8}-[2-9]{4}$/;

test.setTimeout(300_000);

async function linkAndSync(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: galleryCopy("addFolder") })
    .first()
    .click();
  const link = page.getByRole("dialog", { name: galleryCopy("linkDialogTitle") });
  await link.getByRole("textbox", { name: galleryCopy("linkLabel") }).fill(FOLDER_URL);
  await expectGalleryA11y(page);
  await link.getByRole("button", { name: galleryCopy("addFolder") }).click();
  await expect(
    visibleText(page, galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SUCCEEDED)),
  ).toBeVisible({
    timeout: 120_000,
  });
  const counts = await page
    .getByText(/^\d+ foto pilihan( \(\d+ hilang\))? · \d+ hasil akhir$/)
    .filter({ visible: true })
    .first()
    .textContent();
  const total = (counts ?? "").split(" · ").reduce((sum, part) => sum + Number.parseInt(part), 0);
  expect(total).toBeGreaterThan(0);
  const thumbnail = page.locator("main img").first();
  await expect(thumbnail).toBeVisible();
  await expect
    .poll(() => thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  // AC-GAL-015, ADR-019: the tile loads from Google by file ID and did not need the fallback route.
  await expect(thumbnail).toHaveAttribute(
    "src",
    /^https:\/\/lh3\.googleusercontent\.com\/d\/[A-Za-z0-9_-]{10,200}=w600$/,
  );
  await expect(thumbnail).toHaveAttribute("referrerpolicy", "no-referrer");
  await expectGalleryA11y(page);
}

async function previewByKeyboard(page: Page): Promise<void> {
  await page.locator("main button:has(img)").first().click();
  const preview = page.getByRole("dialog", { name: /^(Preview|Pratinjau) / });
  await expect(preview).toBeVisible();
  const first = await preview.getByRole("heading").textContent();
  await page.keyboard.press("ArrowRight");
  await expect(preview.getByRole("heading")).not.toHaveText(first ?? "");
  await expectGalleryA11y(page);
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();

  await page.getByRole("button", { name: galleryCopy("viewAll") }).click();
  const all = page.getByRole("dialog", { name: galleryCopy("allPhotosTitle") });
  await expect(all.locator("img").first()).toBeVisible();
  await expectGalleryA11y(page);
  await page.keyboard.press("Escape");
  await expect(all).toBeHidden();
}

async function openFromMenu(page: Page, item: string, dialogTitle: string) {
  await page.getByRole("button", { name: galleryCopy("galleryMenu") }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expectGalleryA11y(page);
  await page.getByRole("menuitem", { name: item }).click();
  const dialog = page.getByRole("dialog", { name: dialogTitle });
  await expect(dialog).toBeVisible();
  await expectGalleryA11y(page);
  return dialog;
}

/** The Owner's password, read from the gallery page's access card; the spec never logs it. */
async function readPassword(page: Page, projectPath: string): Promise<string> {
  await page.goto(`${projectPath}/gallery`);
  const password = page.getByText(PASSWORD_SHAPE).filter({ visible: true }).first();
  await expect(password).toBeVisible();
  return (await password.textContent()) ?? "";
}

/** The day of the month in the gallery zone, as the calendar cell shows it (AC-GFL-012: today). */
function todayDay(): string {
  return String(Number(todayInGalleryZone(new Date()).slice(8, 10)));
}

/** The Owner closes the gallery by setting the expiry to today, then reopens it by clearing the expiry (AC-GFL-012). */
async function closeThenReopen(page: Page, browser: Browser, projectPath: string): Promise<void> {
  const password = await readPassword(page, projectPath);
  // AC-GFL-006: the ⋯ menu offers only expiry and password, no publish, archive or delete.
  await page.getByRole("button", { name: galleryCopy("galleryMenu") }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();

  const expiry = await openFromMenu(
    page,
    galleryCopy("changeExpiry"),
    galleryCopy("expiryDialogTitle"),
  );
  await page.keyboard.press("Escape");
  await expect(expiry).toBeHidden();
  const rotate = await openFromMenu(
    page,
    galleryCopy("rotatePassword"),
    galleryCopy("rotateDialogTitle"),
  );
  await page.keyboard.press("Escape");
  await expect(rotate).toBeHidden();

  const expiryToday = await openFromMenu(
    page,
    galleryCopy("changeExpiry"),
    galleryCopy("expiryDialogTitle"),
  );
  // React Aria hides the radio input under its styled circle, so press the label.
  await expiryToday.getByText(galleryCopy("expiryOptionDate"), { exact: true }).click();
  await expiryToday
    .getByRole("button", { name: new RegExp(galleryCopy("expiryDateLabel")) })
    .click();
  await page.getByRole("grid").getByText(todayDay(), { exact: true }).first().click();
  await expiryToday.getByRole("button", { name: galleryCopy("expirySave") }).click();
  await expect(expiryToday).toBeHidden();
  await expect(visibleText(page, galleryCopy(GALLERY_STATUS_MESSAGE_KEY.EXPIRED))).toBeVisible();

  const projectId = projectPath.split("/").at(-1) ?? "";
  const clientPath = `/g/${await clientToken(projectId)}`;
  const passwordField = 'input[name="password"]';
  const client = await browser.newContext();
  try {
    const visitor = await client.newPage();
    await expect(async () => {
      await visitor.goto(clientPath);
      await expect(visitor.getByText(unavailableCopy("title"))).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
    await expectGalleryA11y(visitor);

    // Reopen: the expiry is cleared, so the same link and password open the gallery again.
    await page
      .getByRole("button", { name: galleryCopy("changeExpiry") })
      .first()
      .click();
    const reopen = page.getByRole("dialog", { name: galleryCopy("expiryDialogTitle") });
    await expect(reopen).toBeVisible();
    await reopen.getByText(galleryCopy("expiryOptionNone"), { exact: true }).click();
    await reopen.getByRole("button", { name: galleryCopy("expirySave") }).click();
    await expect(reopen).toBeHidden();

    await expect(async () => {
      await visitor.goto(clientPath);
      await expect(visitor.locator(passwordField)).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
    await visitor.locator(passwordField).fill(password);
    await visitor.getByRole("button", { name: passwordCopy("submit") }).click();
    // The gate and Beranda share the URL; once the gate goes, *Semua foto* shows the proofs.
    await expect(visitor.locator(passwordField)).toBeHidden({ timeout: 30_000 });
    await expect(visitor).toHaveURL(clientPath);
    await visitor.goto(`${clientPath}/photos`);
    await expect(visitor.locator("main img").first()).toBeVisible({ timeout: 60_000 });
  } finally {
    await client.close();
  }
}

test("real Drive: link a public folder, sync, preview, close and reopen the gallery with axe on every surface", async ({
  page,
  browser,
}) => {
  // AC-GFL-001: the booking creates the gallery; there is no create or publish step.
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await bookGalleryPage(page, workspaceId);

  await linkAndSync(page);
  await previewByKeyboard(page);
  await closeThenReopen(page, browser, projectPath);
});
