import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, expectGalleryA11y, openGalleryWorkspace, visibleText } from "./gallery-e2e";

// Needs the dev server to run with E2E_FAKE_DRIVE=1 (the AC fixture tree, no Google).
test.setTimeout(180_000);
test.describe.configure({ retries: 2 });

const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";
const NOT_PUBLIC = "https://drive.google.com/drive/folders/fixtureNotPublic01";

async function createGallery(page: Page): Promise<void> {
  const workspaceId = await openGalleryWorkspace(page);
  await createProject(page, workspaceId, "BOOKED");
  await page.getByRole("button", { name: GALLERY_COPY.create }).click();
  const dialog = page.getByRole("dialog", { name: GALLERY_COPY.createDialogTitle });
  await dialog.getByRole("button", { name: GALLERY_COPY.create }).click();
  await expect(visibleText(page, GALLERY_COPY.createdTitle)).toBeVisible();
}

async function linkFolder(page: Page, url: string): Promise<void> {
  await page.getByRole("button", { name: GALLERY_COPY.addFolder }).first().click();
  const link = page.getByRole("dialog", { name: GALLERY_COPY.linkDialogTitle });
  await link.getByRole("textbox", { name: GALLERY_COPY.linkLabel }).fill(url);
  await link.getByRole("button", { name: GALLERY_COPY.addFolder }).click();
}

test("AC-GAL-005 AC-GAL-006 AC-GAL-008 AC-GAL-032 links a folder, syncs it step by step, re-syncs and shows a failed folder", async ({
  page,
}) => {
  await createGallery(page);

  await linkFolder(page, RINA);
  await expect(visibleText(page, GALLERY_COPY.sourceChip.SUCCEEDED)).toBeVisible({
    timeout: 60_000,
  });
  await expect(visibleText(page, "4 proof · 3 edited · 1 print")).toBeVisible();
  await expectGalleryA11y(page);

  await page.getByRole("button", { name: GALLERY_COPY.sourceMenu("Rina-Wisuda") }).click();
  await page.getByRole("menuitem", { name: GALLERY_COPY.sync }).click();
  await expect(visibleText(page, "4 proof · 3 edited · 1 print")).toBeVisible();
  await expect(visibleText(page, GALLERY_COPY.sourceChip.SUCCEEDED)).toBeVisible();

  await linkFolder(page, NOT_PUBLIC);
  await expect(visibleText(page, GALLERY_COPY.sourceChip.FAILED)).toBeVisible({
    timeout: 60_000,
  });
  await expect(visibleText(page, GALLERY_COPY.syncError.NOT_PUBLIC)).toBeVisible();
  await expectGalleryA11y(page);
});
