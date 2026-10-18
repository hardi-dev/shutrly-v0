import { existsSync, readFileSync } from "node:fs";

import { neon } from "@neondatabase/serverless";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { parse } from "dotenv";

import {
  GALLERY_COPY_NAMESPACE,
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
} from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, openGalleryWorkspace, visibleText } from "../gallery/gallery-e2e";

const galleryCopy = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

export const GALLERY_PASSWORD = "mawar-4821";
// The real-Drive public folder from .env.test (same as the F-09 smoke test).
export const FOLDER_URL = process.env.GALLERY_SMOKE_FOLDER_URL ?? "";

/** The project's client link token, read from the non-production database the dev server uses. */
export async function clientToken(projectId: string): Promise<string> {
  const vars = existsSync(".dev.vars") ? parse(readFileSync(".dev.vars")) : {};
  const url = vars.DATABASE_URL;
  const rows = await neon(url)`select client_access_token from project where id = ${projectId}`;
  const token: unknown = rows[0]?.client_access_token;
  if (typeof token !== "string") throw new Error("project token not found");
  return token;
}

/**
 * Links a Drive folder on the project's gallery page and waits for its first sync. The gallery
 * already exists (F-27: it is created with the booking), and there is no publish step.
 */
export async function linkFolder(
  page: Page,
  projectPath: string,
  folderUrl: string,
): Promise<void> {
  await page.goto(`${projectPath}/gallery`);
  await page
    .getByRole("button", { name: galleryCopy("addFolder") })
    .first()
    .click();
  const link = page.getByRole("dialog", { name: galleryCopy("linkDialogTitle") });
  await link.getByRole("textbox", { name: galleryCopy("linkLabel") }).fill(folderUrl);
  await link.getByRole("button", { name: galleryCopy("addFolder") }).click();
  // The dialog closes only once the folder is linked; a refused link keeps it open with its error,
  // so waiting for it stops a page-wide *Tersinkron* match from passing before the link lands.
  await expect(link).toBeHidden({ timeout: 90_000 });
  await expect(
    visibleText(page, galleryCopy(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SUCCEEDED)),
  ).toBeVisible({
    timeout: 120_000,
  });
}

/**
 * Sets the gallery password from the gallery menu (*Change password*), because the generated one
 * is unknown to the test. Runs on the gallery page.
 */
export async function setGalleryPassword(page: Page, password: string): Promise<void> {
  await page.getByRole("button", { name: galleryCopy("galleryMenu") }).click();
  await page.getByRole("menuitem", { name: galleryCopy("rotatePassword") }).click();
  const rotate = page.getByRole("dialog", { name: galleryCopy("rotateDialogTitle") });
  await rotate.getByRole("textbox", { name: galleryCopy("rotateLabel") }).fill(password);
  await rotate.getByRole("button", { name: galleryCopy("rotatePassword") }).click();
  await expect(rotate).toBeHidden();
}

/**
 * Books a project for *Rina* from *Wisuda* (the gallery is created with the booking), links the
 * folder, sets the fixture password and waits for the sync. @returns the project id and its client path
 */
export async function linkedGallery(page: Page, folderUrl = FOLDER_URL) {
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await linkFolder(page, projectPath, folderUrl);
  await setGalleryPassword(page, GALLERY_PASSWORD);
  const projectId = projectPath.split("/").at(-1) ?? "";
  return { projectId, clientPath: `/g/${await clientToken(projectId)}` };
}
