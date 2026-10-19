import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
  GALLERY_SYNC_ERROR_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import {
  bookGalleryPage,
  expectGalleryA11y,
  openGalleryWorkspace,
  visibleText,
} from "./gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

// Needs the dev server to run with E2E_FAKE_DRIVE=1 (the AC fixture tree, no Google).
test.setTimeout(180_000);
test.describe.configure({ retries: 2 });

const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";
const NOT_PUBLIC = "https://drive.google.com/drive/folders/fixtureNotPublic01";

/** Books the project for *Rina*: the booking has already created the gallery, so the spec only links folders on it (AC-GFL-001, AC-GFL-007). */
async function bookGallery(page: Page): Promise<void> {
  const workspaceId = await openGalleryWorkspace(page);
  await bookGalleryPage(page, workspaceId);
}

async function linkFolder(page: Page, url: string): Promise<void> {
  await page
    .getByRole("button", { name: galleryCopy("addFolder") })
    .first()
    .click();
  const link = page.getByRole("dialog", { name: galleryCopy("linkDialogTitle") });
  await link.getByRole("textbox", { name: galleryCopy("linkLabel") }).fill(url);
  await link.getByRole("button", { name: galleryCopy("addFolder") }).click();
}

test("AC-GFL-001 AC-GAL-005 AC-GAL-006 AC-GAL-008 AC-GAL-032 links a folder on the booked gallery, syncs it step by step, re-syncs and shows a failed folder", async ({
  page,
}) => {
  await bookGallery(page);

  await linkFolder(page, RINA);
  await expect(
    visibleText(page, galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SUCCEEDED)),
  ).toBeVisible({
    timeout: 60_000,
  });
  // F-21: no folder is recognised by name, so the whole unmapped fixture is proofs.
  await expect(visibleText(page, "8 foto pilihan · 0 hasil akhir")).toBeVisible();
  // AC-GAL-015: with the fixture Drive the tiles use the Owner media route, never a Drive URL.
  const thumbnail = page.locator("main img").first();
  await expect(thumbnail).toHaveAttribute(
    "src",
    /^\/api\/w\/[0-9a-f-]+\/gallery-photos\/[0-9a-f-]+\/thumb$/,
  );
  await expect(thumbnail).toHaveAttribute("referrerpolicy", "no-referrer");
  await expectGalleryA11y(page);

  await page
    .getByRole("button", { name: galleryCopy("sourceMenu", { name: "Rina-Wisuda" }) })
    .click();
  await page.getByRole("menuitem", { name: galleryCopy("sync") }).click();
  // The re-sync runs its steps first, so the row is *Menyinkronkan* for a while on a cold server.
  await expect(
    visibleText(page, galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SUCCEEDED)),
  ).toBeVisible({
    timeout: 60_000,
  });
  await expect(visibleText(page, "8 foto pilihan · 0 hasil akhir")).toBeVisible();

  await linkFolder(page, NOT_PUBLIC);
  await expect(visibleText(page, galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.FAILED))).toBeVisible({
    timeout: 60_000,
  });
  await expect(
    visibleText(page, galleryCopy(GALLERY_SYNC_ERROR_MESSAGE_KEY.NOT_PUBLIC)),
  ).toBeVisible();
  await expectGalleryA11y(page);
});
