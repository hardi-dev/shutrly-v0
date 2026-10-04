import "server-only";

import { parseDriveFolderLink } from "@/features/gallery/domain/drive-folder-link/drive-folder-link";
import {
  canEditSources,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { InsertedSource } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { linkGallerySourceSchema } from "../../schemas/link-gallery-source/link-gallery-source.schema";
import {
  galleryFailure,
  galleryFieldFailure,
  toGalleryValidationFailure,
} from "../gallery-results/gallery-results";
import type { GalleryFailure } from "../gallery-results/gallery-results.types";
import type { LinkGallerySourceDeps, LinkGallerySourceResult } from "./link-gallery-source.types";

/** Links a public Drive folder to the gallery from an active workspace source; the page syncs it next, step by step (D-27; BR-SRC-002, BR-SRC-006, BR-GAL-009, AC-GAL-005, 009–011). @param deps - repositories, provider, rate limiter and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @param input - untrusted `{ workspaceSourceId, link, label }` @returns the new source, or a failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function linkGallerySource(
  deps: LinkGallerySourceDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
  input: unknown,
): Promise<LinkGallerySourceResult> {
  const parsed = linkGallerySourceSchema.safeParse(input);
  if (!parsed.success) return toGalleryValidationFailure(parsed.error.issues);
  const link = parseDriveFolderLink(parsed.data.link);
  if (!link.ok) return galleryFieldFailure({ link: link.code });
  const folder = { folderId: link.folderId, resourceKey: link.resourceKey };
  const label = parsed.data.label === "" ? null : parsed.data.label;
  const inserted = await deps.sources.withLockedGallery<InsertedSource | GalleryFailure>(
    context,
    galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canEditSources(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      if (!(await writer.isWorkspaceSourceActive(parsed.data.workspaceSourceId))) {
        return galleryFieldFailure({ workspaceSourceId: "SOURCE_NOT_ACTIVE" });
      }
      const row = { workspaceSourceId: parsed.data.workspaceSourceId, folder, label, actorId };
      const outcome = await writer.insertSource(row);
      return outcome === "FOLDER_ALREADY_LINKED"
        ? galleryFieldFailure({ link: "FOLDER_ALREADY_LINKED" })
        : outcome;
    },
  );
  if (inserted === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  if ("ok" in inserted) return inserted;
  return { ok: true, sourceId: inserted.sourceId };
}
