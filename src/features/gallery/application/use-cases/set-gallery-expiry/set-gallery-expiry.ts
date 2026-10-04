import "server-only";

import { resolveExpiry } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import {
  canSetExpiry,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { setGalleryExpirySchema } from "../../schemas/set-gallery-expiry/set-gallery-expiry.schema";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import {
  galleryFailure,
  galleryFieldFailure,
  toGalleryValidationFailure,
} from "../gallery-results/gallery-results";
import type { ExpiryResult } from "../gallery-results/gallery-results.types";

/** Changes the expiry: none, an end date, or days (kept on a draft, counted from now otherwise); a later or no expiry re-opens an expired gallery (BR-GAL-005, AC-GAL-018…020). @param deps - repository and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @param input - untrusted `{ expiry }` @returns ok with whether it re-opened, or a failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function setGalleryExpiry(
  deps: GalleryLifecycleDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
  input: unknown,
): Promise<ExpiryResult> {
  const parsed = setGalleryExpirySchema.safeParse(input);
  if (!parsed.success) return toGalleryValidationFailure(parsed.error.issues);
  return withGalleryLock<ExpiryResult>(
    deps.sources,
    context,
    galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canSetExpiry(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      const resolved = resolveExpiry(parsed.data.expiry, status, deps.now);
      if (!resolved.ok) return galleryFieldFailure({ "expiry.date": "PAST_DATE" });
      await writer.setExpiry(resolved.expiry, actorId, deps.now);
      const after = effectiveGalleryStatus(gallery.status, resolved.expiry.expiresAt, deps.now);
      return { ok: true, reopened: status === "EXPIRED" && after === "PUBLISHED" };
    },
  );
}
