import "server-only";

import { resolveExpiry } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import { galleryAllowedForProject } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { createGallerySchema } from "../../schemas/create-gallery/create-gallery.schema";
import {
  galleryFailure,
  galleryFieldFailure,
  toGalleryValidationFailure,
} from "../gallery-results/gallery-results";
import type { CreateGalleryResult } from "../gallery-results/gallery-results.types";
import type { CreateGalleryDeps } from "./create-gallery.types";

/** Creates the project's one DRAFT gallery with an encrypted, hashed password (BR-GAL-001, BR-GAL-002, BR-GAL-009, ADR-017). @param deps - gallery ports, id source and clock @param context - verified workspace @param actorId - the signed-in owner @param projectId - the project id @param input - untrusted `{ password, expiry }` @returns the new gallery id or a failure @throws GalleryError NOT_FOUND for another workspace's project */
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
      const row = { id, projectId, password, passwordHash, actorId, ...expiry.expiry };
      const outcome = await writer.insert(row);
      return outcome === "CREATED" ? { ok: true, galleryId: id } : galleryFailure("ALREADY_EXISTS");
    },
  );
  if (result === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  return result;
}
