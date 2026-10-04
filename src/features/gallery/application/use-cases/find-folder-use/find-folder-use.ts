import "server-only";

import { parseDriveFolderLink } from "@/features/gallery/domain/drive-folder-link/drive-folder-link";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { folderLinkSchema } from "../../schemas/link-gallery-source/link-gallery-source.schema";
import {
  galleryFieldFailure,
  toGalleryValidationFailure,
} from "../gallery-results/gallery-results";
import type { FolderUseResult } from "./find-folder-use.types";

/** Checks a folder link and names other projects whose gallery already links that folder, for the warning before linking (BR-GAL-009, AC-GAL-009, AC-GAL-010). @param sources - source repository @param context - verified workspace @param galleryId - the gallery being edited @param rawLink - untrusted link @returns the other projects' titles, or a field error */
export async function findFolderUse(
  sources: GallerySourceRepositoryPort,
  context: WorkspaceContext,
  galleryId: string,
  rawLink: unknown,
): Promise<FolderUseResult> {
  const parsed = folderLinkSchema.safeParse(rawLink);
  if (!parsed.success) {
    return toGalleryValidationFailure(
      parsed.error.issues.map((issue) => ({ ...issue, path: ["link"] })),
    );
  }
  const link = parseDriveFolderLink(parsed.data);
  if (!link.ok) return galleryFieldFailure({ link: link.code });
  return {
    ok: true,
    projectTitles: await sources.findFolderUse(context, galleryId, link.folderId),
  };
}
