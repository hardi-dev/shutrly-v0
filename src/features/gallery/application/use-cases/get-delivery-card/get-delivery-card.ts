import "server-only";

import { deliveryCardState } from "@/features/gallery/domain/final-delivery/final-delivery";
import { effectiveGalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { DeliveryCardView, GetDeliveryCardDeps } from "./get-delivery-card.types";

/**
 * Loads the *Hasil akhir* card: its state (A–E), the finished-file counts, when final delivery was
 * published and when the project was completed (spec §5–6, D-20, AC-DEL-001, AC-DEL-007).
 * @param deps - the delivery reader and the clock
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the card view
 * @throws GalleryError NOT_FOUND for another workspace's project
 */
export async function getDeliveryCard(
  deps: GetDeliveryCardDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<DeliveryCardView> {
  const facts = await deps.reader.findFacts(context, projectId);
  if (!facts) throw new GalleryError("NOT_FOUND");
  const { gallery } = facts;
  const editedCount = gallery?.editedCount ?? 0;
  const printCount = gallery?.printCount ?? 0;
  const status = gallery
    ? effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now)
    : null;
  const publishedAt = gallery?.finalDeliveryPublishedAt ?? null;
  return {
    state: deliveryCardState({
      status,
      finishedCount: editedCount + printCount,
      published: publishedAt !== null,
      projectStatus: facts.projectStatus,
    }),
    projectTitle: facts.projectTitle,
    editedCount,
    printCount,
    publishedAt: publishedAt?.toISOString() ?? null,
    completedAt: facts.completedAt?.toISOString() ?? null,
    canComplete: facts.projectStatus === "DELIVERED",
    isShown: facts.projectStatus !== "DRAFT" && facts.projectStatus !== "CANCELLED",
  };
}
