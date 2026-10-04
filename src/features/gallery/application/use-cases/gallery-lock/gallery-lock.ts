import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type {
  GallerySourceRepositoryPort,
  GallerySourceWriter,
  LockedGalleryState,
} from "../../ports/gallery-source-repository/gallery-source-repository.port";

/** Runs a lifecycle change under the gallery lock and maps a missing gallery to NOT_FOUND (C-005, C-101). @param sources - the repository @param context - verified workspace @param galleryId - the gallery id @param work - the change, deciding from the locked state @returns the change's result @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function withGalleryLock<T>(
  sources: GallerySourceRepositoryPort,
  context: WorkspaceContext,
  galleryId: string,
  work: (gallery: LockedGalleryState, writer: GallerySourceWriter) => Promise<T>,
): Promise<T> {
  const result = await sources.withLockedGallery<T>(context, galleryId, work);
  if (result === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  return result;
}
