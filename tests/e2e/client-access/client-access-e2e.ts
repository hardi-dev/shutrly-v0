import { existsSync, readFileSync } from "node:fs";

import { neon } from "@neondatabase/serverless";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { parse } from "dotenv";

import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";

import { createProject, openGalleryWorkspace, visibleText } from "../gallery/gallery-e2e";

export const GALLERY_PASSWORD = "mawar-4821";
// The real-Drive public folder from .env.test (same as the F-09 smoke test).
export const FOLDER_URL = process.env.GALLERY_SMOKE_FOLDER_URL ?? "";

/** The project's client link token, read from the non-production database the dev server uses. The Owner UI shows the link only from Slice 10 on. */
export async function clientToken(projectId: string): Promise<string> {
  const vars = existsSync(".dev.vars") ? parse(readFileSync(".dev.vars")) : {};
  const url = vars.DATABASE_URL;
  const rows = await neon(url)`select client_access_token from project where id = ${projectId}`;
  const token: unknown = rows[0]?.client_access_token;
  if (typeof token !== "string") throw new Error("project token not found");
  return token;
}

/** Registers an Owner and publishes a gallery with the fixture password over the smoke folder. @returns the project id and its client path */
export async function publishedGallery(page: Page) {
  const workspaceId = await openGalleryWorkspace(page);
  const projectPath = await createProject(page, workspaceId, "BOOKED");
  await page.getByRole("button", { name: GALLERY_COPY.create }).click();
  const create = page.getByRole("dialog", { name: GALLERY_COPY.createDialogTitle });
  await create.getByRole("textbox", { name: GALLERY_COPY.passwordLabel }).fill(GALLERY_PASSWORD);
  await create.getByRole("button", { name: GALLERY_COPY.create }).click();
  await expect(page).toHaveURL(`${projectPath}/gallery`);
  await page.getByRole("button", { name: GALLERY_COPY.addFolder }).first().click();
  const link = page.getByRole("dialog", { name: GALLERY_COPY.linkDialogTitle });
  await link.getByRole("textbox", { name: GALLERY_COPY.linkLabel }).fill(FOLDER_URL);
  await link.getByRole("button", { name: GALLERY_COPY.addFolder }).click();
  await expect(visibleText(page, GALLERY_COPY.sourceChip.SUCCEEDED)).toBeVisible({
    timeout: 120_000,
  });
  await page.getByRole("button", { name: GALLERY_COPY.publish }).first().click();
  const publish = page.getByRole("dialog", { name: GALLERY_COPY.publishDialogTitle });
  await publish.getByRole("button", { name: GALLERY_COPY.publish }).click();
  await expect(visibleText(page, GALLERY_COPY.publishedTitle)).toBeVisible();
  const projectId = projectPath.split("/").at(-1) ?? "";
  return { projectId, clientPath: `/g/${await clientToken(projectId)}` };
}
