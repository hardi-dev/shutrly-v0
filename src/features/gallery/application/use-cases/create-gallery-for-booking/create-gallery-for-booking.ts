import "server-only";

import { galleryAllowedForProject } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type {
  CreateGalleryForBookingDeps,
  CreateGalleryForBookingResult,
  PreparedGalleryPassword,
  PrepareGalleryPasswordDeps,
} from "./create-gallery-for-booking.types";

/**
 * Prepares the password work for a new gallery: an id, the encrypted password and its hash. It runs
 * before the project transaction, because scrypt is slow and must not hold the project lock (ADR-017, D-4).
 * @param deps - cipher, hasher, password proposer and id source
 * @param context - verified workspace, which scopes the ciphertext
 * @returns the prepared gallery id, ciphertext and hash
 */
export async function prepareGalleryPassword(
  deps: PrepareGalleryPasswordDeps,
  context: WorkspaceContext,
): Promise<PreparedGalleryPassword> {
  const galleryId = deps.newId();
  const plaintext = deps.passwords.propose();
  const password = await deps.cipher.encrypt(plaintext, {
    workspaceId: context.workspaceId,
    galleryId,
  });
  const passwordHash = await deps.hasher.hash(plaintext);
  return { galleryId, password, passwordHash };
}

/**
 * Creates the one gallery of a booked project, with no expiry and no source, and its selection groups,
 * under the project lock. A project that already has a gallery is a no-op success, so the backfill can rerun
 * (BR-GAL-001, BR-GAL-002, BR-SEL-001, AC-GFL-001, AC-GFL-004).
 * @param deps - gallery repository port
 * @param context - verified workspace
 * @param actorId - the signed-in owner who booked the project
 * @param projectId - the project that owns the gallery
 * @param prepared - the output of prepareGalleryPassword
 * @returns created true for a new gallery, false when one already existed, or NOT_ALLOWED_FOR_PROJECT for a draft or cancelled project
 * @throws GalleryError NOT_FOUND for another workspace's project
 */
export async function createGalleryForBooking(
  deps: CreateGalleryForBookingDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  prepared: PreparedGalleryPassword,
): Promise<CreateGalleryForBookingResult> {
  const result = await deps.galleries.withProjectForGallery<CreateGalleryForBookingResult>(
    context,
    projectId,
    async (project, writer) => {
      if (!galleryAllowedForProject(project.status)) {
        return { ok: false, code: "NOT_ALLOWED_FOR_PROJECT" };
      }
      const outcome = await writer.insert({
        id: prepared.galleryId,
        projectId,
        password: prepared.password,
        passwordHash: prepared.passwordHash,
        expiresAt: null,
        actorId,
      });
      if (outcome === "ALREADY_EXISTS") return { ok: true, created: false };
      await writer.createSelectionGroups(prepared.galleryId);
      return { ok: true, created: true };
    },
  );
  if (result === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  return result;
}
