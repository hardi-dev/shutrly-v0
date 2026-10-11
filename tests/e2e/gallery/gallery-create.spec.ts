import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_ERROR_MESSAGE_KEY,
  GALLERY_STATUS_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, expectGalleryA11y, openGalleryWorkspace, visibleText } from "./gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

test.setTimeout(180_000);
test.describe.configure({ retries: 2 });

test("AC-GAL-001 AC-GAL-003 AC-GAL-027 creates a gallery from a booked project and shows its password", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const workspaceId = await openGalleryWorkspace(page);

  await createProject(page, workspaceId, "DRAFT");
  await expect(visibleText(page, galleryCopy("cardDraftProjectTitle"))).toBeVisible();
  await expect(page.getByRole("button", { name: galleryCopy("create") })).toHaveCount(0);

  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await expect(visibleText(page, galleryCopy("cardEmptyTitle"))).toBeVisible();
  await page.getByRole("button", { name: galleryCopy("create") }).click();
  const dialog = page.getByRole("dialog", { name: galleryCopy("createDialogTitle") });
  const password = dialog.getByRole("textbox", { name: galleryCopy("passwordLabel") });
  await expect(password).toHaveValue(/^[a-z]{4,8}-[2-9]{4}$/);
  const first = await password.inputValue();
  await dialog.getByRole("button", { name: galleryCopy("regenerate") }).click();
  await expect(password).not.toHaveValue(first);
  await expectGalleryA11y(page);

  await password.fill("abc12");
  await dialog.getByRole("button", { name: galleryCopy("create") }).click();
  await expect(dialog.getByText(galleryCopy(GALLERY_ERROR_MESSAGE_KEY.TOO_SHORT))).toBeVisible();
  await password.fill("mawar-4821");
  await dialog.getByRole("button", { name: galleryCopy("create") }).click();

  await expect(page).toHaveURL(`${projectPath}/gallery`);
  await expect(visibleText(page, galleryCopy("createdTitle"))).toBeVisible();
  await expect(visibleText(page, "mawar-4821")).toBeVisible();
  await expect(visibleText(page, galleryCopy("sourcesEmptyTitle"))).toBeVisible();
  await page
    .getByRole("button", { name: galleryCopy("copyPassword") })
    .first()
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("mawar-4821");
  await expectGalleryA11y(page);

  await page.goto(projectPath);
  await expect(visibleText(page, galleryCopy(GALLERY_STATUS_MESSAGE_KEY.DRAFT))).toBeVisible();
  await expect(visibleText(page, "mawar-4821")).toBeVisible();
  await expect(page.getByRole("button", { name: galleryCopy("create") })).toHaveCount(0);
});
