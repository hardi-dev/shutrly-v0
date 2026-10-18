import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
  GALLERY_STATUS_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, expectGalleryA11y, openGalleryWorkspace, visibleText } from "./gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

// Real-Drive smoke test plus the axe and keyboard pass per surface (plan Slice 8). It needs a
// public folder, so playwright.config.ts runs it only when GALLERY_SMOKE_FOLDER_URL is set; the
// dev server must run without E2E_FAKE_DRIVE.
const FOLDER_URL = process.env.GALLERY_SMOKE_FOLDER_URL ?? "";

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
    .getByText(/^\d+ proof( \(\d+ hilang\))? · \d+ hasil akhir$/)
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

async function openFromMenu(
  page: Page,
  item: string,
  dialogTitle: string,
  role: "dialog" | "alertdialog" = "dialog",
) {
  await page.getByRole("button", { name: galleryCopy("galleryMenu") }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expectGalleryA11y(page);
  await page.getByRole("menuitem", { name: item }).click();
  const dialog = page.getByRole(role, { name: dialogTitle });
  await expect(dialog).toBeVisible();
  await expectGalleryA11y(page);
  return dialog;
}

async function publishThenArchive(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: galleryCopy("publish") })
    .first()
    .click();
  const publish = page.getByRole("dialog", { name: galleryCopy("publishDialogTitle") });
  await expectGalleryA11y(page);
  await publish.getByRole("button", { name: galleryCopy("publish") }).click();
  await expect(visibleText(page, galleryCopy("publishedTitle"))).toBeVisible();
  await expect(visibleText(page, galleryCopy(GALLERY_STATUS_MESSAGE_KEY.OPEN))).toBeVisible();

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
  const archive = await openFromMenu(
    page,
    galleryCopy("archive"),
    galleryCopy("archiveDialogTitle"),
    "alertdialog",
  );
  await archive.getByRole("button", { name: galleryCopy("archive") }).click();
  await expect(visibleText(page, galleryCopy(GALLERY_STATUS_MESSAGE_KEY.CLOSED))).toBeVisible();
  await expectGalleryA11y(page);
}

test("real Drive: link a public folder, sync, preview, publish and archive with axe on every surface", async ({
  page,
}) => {
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await page.getByRole("button", { name: galleryCopy("create") }).click();
  const create = page.getByRole("dialog", { name: galleryCopy("createDialogTitle") });
  await create.getByRole("button", { name: galleryCopy("create") }).click();
  await expect(page).toHaveURL(`${projectPath}/gallery`);

  await linkAndSync(page);
  await previewByKeyboard(page);
  await publishThenArchive(page);
});
