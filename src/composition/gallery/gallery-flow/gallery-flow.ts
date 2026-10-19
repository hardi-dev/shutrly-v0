import "server-only";

import { cache } from "react";

import { getGalleryCard } from "@/features/gallery/application/use-cases/get-gallery-card/get-gallery-card";
import { getGalleryPage } from "@/features/gallery/application/use-cases/get-gallery-page/get-gallery-page";
import { proposeGalleryPassword } from "@/features/gallery/application/use-cases/propose-gallery-password/propose-gallery-password";

import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import {
  galleryIdOrNotFound,
  gallerySaveError,
} from "../gallery-flow-support/gallery-flow-support";
import { withGalleryScope } from "../gallery-scope/gallery-scope";

/** Proposes a gallery password for the create dialog's *Buat ulang* (D-5). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the proposal */
export async function proposeGalleryPasswordEntry(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ galleries, randomInt }) =>
      proposeGalleryPassword(galleries, randomInt, verified.context, projectId),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "propose-password");
  }
}

/** Loads the project detail's Galeri card (D-16). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the card view */
export async function loadGalleryCard(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ galleries, cipher, now }) =>
      getGalleryCard(galleries, cipher, verified.context, projectId, now),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "card");
  }
}

/** Loads the gallery page of a project. @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the page view */
async function loadGalleryPageUncached(rawWorkspaceId: string, rawProjectId: string) {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(
      async ({ galleries, workspaceSources, cipher, now, directImages }) => ({
        ...(await getGalleryPage(
          galleries,
          workspaceSources,
          cipher,
          verified.context,
          projectId,
          now,
        )),
        directImages,
      }),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "page");
  }
}

/** Loads the gallery page of a project; one lookup per request (ADR-026). */
export const loadGalleryPage = cache(loadGalleryPageUncached);
