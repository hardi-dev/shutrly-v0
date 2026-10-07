import "server-only";

import {
  canEditSources,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import { kindForPickMode } from "@/features/gallery/domain/photo-classification/photo-classification";
import type { FolderMapping } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { MappableItem } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { setFolderMappingSchema } from "../../schemas/folder-mapping/folder-mapping.schema";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import { galleryFailure, galleryFieldFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";
import type { FolderMappingView } from "./folder-mapping.types";

/** Loads the folder *Edit*'s mapping: the subfolders found by the last sync, this project's selection items and the saved mapping (F-20). @param deps - repository @param context - verified workspace @param sourceId - the gallery source @returns the view @throws GalleryError NOT_FOUND for a missing or another workspace's source */
export async function getFolderMapping(
  deps: Pick<GalleryLifecycleDeps, "sources">,
  context: WorkspaceContext,
  sourceId: string,
): Promise<FolderMappingView> {
  const record = await deps.sources.findFolderMapping(context, sourceId);
  if (!record) throw new GalleryError("NOT_FOUND");
  return { folders: record.folders, items: record.items, mappings: record.mappings };
}

function toMappings(
  entries: readonly { path: string; projectItemId: string }[],
  items: readonly MappableItem[],
): FolderMapping[] | null {
  const mappings: FolderMapping[] = [];
  for (const entry of entries) {
    const item = items.find((candidate) => candidate.id === entry.projectItemId);
    if (!item) return null;
    mappings.push({ ...entry, kind: kindForPickMode(item.pickMode) });
  }
  return mappings;
}

/** Saves a folder's subfolder mapping and reclassifies its photos at once (F-20, Owner 2026-10-07): one subfolder → one selection item of this project; unmapped folders stay proofs. @param deps - repository and clock @param context - verified workspace @param sourceId - the gallery source @param input - untrusted `{ mappings }` @returns ok or a failure @throws GalleryError NOT_FOUND for a missing or another workspace's source */
export async function setFolderMapping(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  sourceId: string,
  input: unknown,
): Promise<GalleryWriteResult> {
  const parsed = setFolderMappingSchema.safeParse(input);
  if (!parsed.success) return galleryFieldFailure({ mappings: "INVALID" });
  const entries = parsed.data.mappings;
  if (new Set(entries.map((entry) => entry.path)).size !== entries.length)
    return galleryFieldFailure({ mappings: "INVALID" });
  const record = await deps.sources.findFolderMapping(context, sourceId);
  if (!record) throw new GalleryError("NOT_FOUND");
  const mappings = toMappings(entries, record.items);
  if (mappings === null) return galleryFieldFailure({ mappings: "INVALID" });
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    record.galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canEditSources(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      await writer.replaceFolderMappings(sourceId, entries);
      await writer.reclassifySource(sourceId, mappings, deps.now);
      return { ok: true };
    },
  );
}
