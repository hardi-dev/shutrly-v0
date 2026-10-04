import { expect, test } from "@playwright/test";

import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, expectGalleryA11y, openGalleryWorkspace, visibleText } from "./gallery-e2e";

test.setTimeout(180_000);
test.describe.configure({ retries: 2 });

test("AC-GAL-001 AC-GAL-003 AC-GAL-027 creates a gallery from a booked project and shows its password", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const workspaceId = await openGalleryWorkspace(page);

  await createProject(page, workspaceId, "DRAFT");
  await expect(visibleText(page, GALLERY_COPY.cardDraftProjectTitle)).toBeVisible();
  await expect(page.getByRole("button", { name: GALLERY_COPY.create })).toHaveCount(0);

  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await expect(visibleText(page, GALLERY_COPY.cardEmptyTitle)).toBeVisible();
  await page.getByRole("button", { name: GALLERY_COPY.create }).click();
  const dialog = page.getByRole("dialog", { name: GALLERY_COPY.createDialogTitle });
  const password = dialog.getByRole("textbox", { name: GALLERY_COPY.passwordLabel });
  await expect(password).toHaveValue(/^[a-z]{4,8}-[2-9]{4}$/);
  const first = await password.inputValue();
  await dialog.getByRole("button", { name: GALLERY_COPY.regenerate }).click();
  await expect(password).not.toHaveValue(first);
  await expectGalleryA11y(page);

  await password.fill("abc12");
  await dialog.getByRole("button", { name: GALLERY_COPY.create }).click();
  await expect(dialog.getByText(GALLERY_COPY.errors.TOO_SHORT)).toBeVisible();
  await password.fill("mawar-4821");
  await dialog.getByRole("button", { name: GALLERY_COPY.create }).click();

  await expect(page).toHaveURL(`${projectPath}/gallery`);
  await expect(visibleText(page, GALLERY_COPY.createdTitle)).toBeVisible();
  await expect(visibleText(page, "mawar-4821")).toBeVisible();
  await expect(visibleText(page, GALLERY_COPY.sourcesEmptyTitle)).toBeVisible();
  await page.getByRole("button", { name: GALLERY_COPY.copyPassword }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("mawar-4821");
  await expectGalleryA11y(page);

  await page.goto(projectPath);
  await expect(visibleText(page, GALLERY_COPY.status.DRAFT)).toBeVisible();
  await expect(visibleText(page, "mawar-4821")).toBeVisible();
  await expect(page.getByRole("button", { name: GALLERY_COPY.create })).toHaveCount(0);
});
