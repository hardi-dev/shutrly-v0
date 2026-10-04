import "server-only";

import { notFound } from "next/navigation";

import { GalleryError } from "@/features/gallery/application/errors/gallery-errors/gallery-errors";
import { galleryProjectIdSchema } from "@/features/gallery/application/schemas/gallery-ids/gallery-ids.schema";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { getGalleryCard } from "@/features/gallery/application/use-cases/get-gallery-card/get-gallery-card";
import { getGalleryPage } from "@/features/gallery/application/use-cases/get-gallery-page/get-gallery-page";
import { proposeGalleryPassword } from "@/features/gallery/application/use-cases/propose-gallery-password/propose-gallery-password";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withGalleryScope } from "../gallery-scope/gallery-scope";

// Logs carry IDs and codes only: never links, keys, passwords or ciphertext (C-103).
function saveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof GalleryError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError))
    logger.error("gallery.save_failed", { workspaceId, operation });
  throw new GalleryError("SAVE_FAILED");
}

function idOrNotFound(rawId: string): string {
  const parsed = galleryProjectIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

/** Proposes a gallery password for the create dialog's *Buat ulang* (D-5). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the proposal */
export async function proposeGalleryPasswordEntry(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = idOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ galleries, randomInt }) =>
      proposeGalleryPassword(galleries, randomInt, verified.context, projectId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "propose-password");
  }
}

/** Creates the project's gallery (AC-GAL-001…004). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @param values - untrusted form values @returns the create result */
export async function createGalleryEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  values: unknown,
) {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope((scope) =>
      createGallery(scope, verified.context, account.id, projectId, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "create");
  }
}

/** Loads the project detail's Galeri card (D-16). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the card view */
export async function loadGalleryCard(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = idOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ galleries, cipher, now }) =>
      getGalleryCard(galleries, cipher, verified.context, projectId, now),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "card");
  }
}

/** Loads the gallery page of a project. @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the page view */
export async function loadGalleryPage(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = idOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ galleries, cipher, now }) =>
      getGalleryPage(galleries, cipher, verified.context, projectId, now),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "page");
  }
}
