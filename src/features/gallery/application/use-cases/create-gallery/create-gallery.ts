import "server-only";

import { parseDriveFolderLink } from "@/features/gallery/domain/drive-folder-link/drive-folder-link";
import { resolveExpiry } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import { galleryAllowedForProject } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryCreateWriter } from "../../ports/gallery-repository/gallery-repository.port";
import type { NewGallerySource } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { createGallerySchema } from "../../schemas/create-gallery/create-gallery.schema";
import {
  galleryFailure,
  galleryFieldFailure,
  toGalleryValidationFailure,
} from "../gallery-results/gallery-results";
import type { CreateGalleryResult, GalleryFailure } from "../gallery-results/gallery-results.types";
import type { CreateGalleryDeps, FirstFolderInput } from "./create-gallery.types";

/** Reads the optional first folder like *Tambah folder* (AC-GAL-009). @param folder - the parsed section or undefined @param actorId - the signed-in owner @returns the source to link, null without one, or a field failure */
function firstFolder(
  folder: FirstFolderInput | undefined,
  actorId: string,
): NewGallerySource | null | GalleryFailure {
  if (!folder) return null;
  const link = parseDriveFolderLink(folder.link);
  if (!link.ok) return galleryFieldFailure({ "folder.link": link.code });
  return {
    workspaceSourceId: folder.workspaceSourceId,
    folder: { folderId: link.folderId, resourceKey: link.resourceKey },
    label: folder.label === "" ? null : folder.label,
    actorId,
  };
}

/** Links the first folder after the insert, in the same transaction; a new gallery has no folder yet, so it can't be a duplicate. @param writer - the create writer @param galleryId - the new gallery @param source - the folder or null @returns the result */
async function linkFirstFolder(
  writer: GalleryCreateWriter,
  galleryId: string,
  source: NewGallerySource | null,
): Promise<CreateGalleryResult> {
  if (!source) return { ok: true, galleryId, sourceId: null };
  const inserted = await writer.insertSource(galleryId, source);
  if (inserted === "FOLDER_ALREADY_LINKED") throw new Error("A new gallery already has a folder.");
  return { ok: true, galleryId, sourceId: inserted.sourceId };
}

/** Creates the project's one DRAFT gallery with an encrypted, hashed password and, optionally, its first folder; a refused folder creates nothing (BR-GAL-001, BR-GAL-002, BR-GAL-009, BR-SRC-006, ADR-017, AC-GAL-001). @param deps - gallery ports, id source and clock @param context - verified workspace @param actorId - the signed-in owner @param projectId - the project id @param input - untrusted `{ password, expiry, folder? }` @returns the new gallery id and folder id, or a failure @throws GalleryError NOT_FOUND for another workspace's project */
export async function createGallery(
  deps: CreateGalleryDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<CreateGalleryResult> {
  const parsed = createGallerySchema.safeParse(input);
  if (!parsed.success) return toGalleryValidationFailure(parsed.error.issues);
  const expiry = resolveExpiry(parsed.data.expiry, "DRAFT", deps.now);
  if (!expiry.ok) return galleryFieldFailure({ "expiry.date": "PAST_DATE" });
  const source = firstFolder(parsed.data.folder, actorId);
  if (source && "ok" in source) return source;
  const id = deps.newId();
  // Encrypt and hash before the transaction: scrypt is slow and must not hold the project lock.
  const password = await deps.cipher.encrypt(parsed.data.password, {
    workspaceId: context.workspaceId,
    galleryId: id,
  });
  const passwordHash = await deps.hasher.hash(parsed.data.password);
  const result = await deps.galleries.withProjectForGallery<CreateGalleryResult>(
    context,
    projectId,
    async (project, writer) => {
      if (!galleryAllowedForProject(project.status)) {
        return galleryFailure("NOT_ALLOWED_FOR_PROJECT");
      }
      if (source && !(await writer.isWorkspaceSourceActive(source.workspaceSourceId))) {
        return galleryFieldFailure({ "folder.workspaceSourceId": "SOURCE_NOT_ACTIVE" });
      }
      const row = { id, projectId, password, passwordHash, actorId, ...expiry.expiry };
      const outcome = await writer.insert(row);
      if (outcome !== "CREATED") return galleryFailure("ALREADY_EXISTS");
      return linkFirstFolder(writer, id, source);
    },
  );
  if (result === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  return result;
}
