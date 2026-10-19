import "server-only";

import { galleryDeliveryReasons } from "@/features/gallery/domain/final-delivery/final-delivery";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  RecordFinalDeliveryDeps,
  RecordFinalDeliveryResult,
} from "./record-final-delivery.types";

const NO_GALLERY = galleryDeliveryReasons({ finishedCount: 0 });

/**
 * Publishes final delivery on the project's gallery under the gallery lock: it must hold a visible,
 * not-missing EDITED or PRINT photo, whatever the gallery's state (BR-DEL-002, BR-DEL-003); then
 * `final_delivery_published_at` / `_by` are set and `content_version` is bumped (BR-DEL-003, A-17,
 * D-17, BR-AUD-001). Runs inside the final-delivery scope after the project lock.
 * @param deps - gallery source repository bound to the scope's transaction, and the clock
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @returns ok, or every reason to refuse
 */
export async function recordFinalDelivery(
  deps: RecordFinalDeliveryDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<RecordFinalDeliveryResult> {
  const galleryId = await deps.sources.findGalleryIdByProject(context, projectId);
  if (!galleryId) return { ok: false, reasons: NO_GALLERY };
  const result = await deps.sources.withLockedGallery<RecordFinalDeliveryResult>(
    context,
    galleryId,
    async (gallery, writer) => {
      const finishedCount = await writer.countFinishedFiles();
      const reasons = galleryDeliveryReasons({ finishedCount });
      if (reasons.length > 0) return { ok: false, reasons };
      await writer.publishFinalDelivery(actorId, deps.now);
      return { ok: true };
    },
  );
  return result === "NOT_FOUND" ? { ok: false, reasons: NO_GALLERY } : result;
}
