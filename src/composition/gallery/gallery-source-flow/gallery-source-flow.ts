import "server-only";

import { browseGalleryPhotos } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos";
import { findFolderUse } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { syncGallerySource } from "@/features/gallery/application/use-cases/sync-gallery-source/sync-gallery-source";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import {
  galleryIdOrNotFound,
  gallerySaveError,
} from "../gallery-flow-support/gallery-flow-support";
import { withGalleryScope } from "../gallery-scope/gallery-scope";

/** Links a Drive folder and syncs it once (AC-GAL-005, 008–011). @param rawWorkspaceId - untrusted workspace id @param rawGalleryId - untrusted gallery id @param values - untrusted form values @returns the link result */
export async function linkGallerySourceEntry(
  rawWorkspaceId: string,
  rawGalleryId: string,
  values: unknown,
) {
  const galleryId = galleryIdOrNotFound(rawGalleryId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope((scope) =>
      linkGallerySource(scope, verified.context, account.id, galleryId, values),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "link-source");
  }
}

/** Checks a folder link before linking: field errors and other projects using it (AC-GAL-009, 010). @param rawWorkspaceId - untrusted workspace id @param rawGalleryId - untrusted gallery id @param link - untrusted link @returns the check result */
export async function checkFolderInUseEntry(
  rawWorkspaceId: string,
  rawGalleryId: string,
  link: unknown,
) {
  const galleryId = galleryIdOrNotFound(rawGalleryId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ sources }) =>
      findFolderUse(sources, verified.context, galleryId, link),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "folder-use");
  }
}

/** Syncs one source (AC-GAL-006, 007, 012). @param rawWorkspaceId - untrusted workspace id @param rawSourceId - untrusted source id @returns the sync outcome */
export async function syncGallerySourceEntry(rawWorkspaceId: string, rawSourceId: string) {
  const sourceId = galleryIdOrNotFound(rawSourceId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope((scope) => syncGallerySource(scope, verified.context, sourceId));
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "sync");
  }
}

/** Reads one page of *Semua foto* (AC-GAL-028…030). @param rawWorkspaceId - untrusted workspace id @param rawGalleryId - untrusted gallery id @param query - untrusted browse query @returns the page */
export async function browseGalleryPhotosEntry(
  rawWorkspaceId: string,
  rawGalleryId: string,
  query: unknown,
) {
  const galleryId = galleryIdOrNotFound(rawGalleryId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withGalleryScope(({ browse }) =>
      browseGalleryPhotos(browse, verified.context, galleryId, query),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "browse");
  }
}
