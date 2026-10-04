import "server-only";

import {
  canRotatePassword,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { rotateGalleryPasswordSchema } from "../../schemas/rotate-gallery-password/rotate-gallery-password.schema";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import { galleryFailure, toGalleryValidationFailure } from "../gallery-results/gallery-results";
import type { GalleryWriteResult } from "../gallery-results/gallery-results.types";
import type { RotateGalleryPasswordDeps } from "./rotate-gallery-password.types";

/** Replaces the password (encrypted and hashed), bumps `passwordVersion` and records who and when (BR-GAL-002, BR-GAL-003, BR-AUD-001, AC-GAL-021). @param deps - repository, cipher, hasher and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @param input - untrusted `{ password }` @returns ok or a failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function rotateGalleryPassword(
  deps: RotateGalleryPasswordDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
  input: unknown,
): Promise<GalleryWriteResult> {
  const parsed = rotateGalleryPasswordSchema.safeParse(input);
  if (!parsed.success) return toGalleryValidationFailure(parsed.error.issues);
  // Encrypt and hash before taking the lock: scrypt is slow.
  const password = await deps.cipher.encrypt(parsed.data.password, {
    workspaceId: context.workspaceId,
    galleryId,
  });
  const passwordHash = await deps.hasher.hash(parsed.data.password);
  return withGalleryLock<GalleryWriteResult>(
    deps.sources,
    context,
    galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canRotatePassword(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      await writer.rotatePassword({ password, passwordHash }, actorId, deps.now);
      return { ok: true };
    },
  );
}
