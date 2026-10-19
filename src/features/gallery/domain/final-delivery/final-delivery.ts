import type {
  DeliveryCardFacts,
  DeliveryCardState,
  FinalDeliveryReason,
  GalleryDeliveryFacts,
} from "./final-delivery.types";

/**
 * The gallery's reasons to refuse marking final delivery: only a missing synced finished file,
 * since a gallery has no state that blocks delivery (BR-DEL-003, BR-DEL-002, AC-GFL-017).
 * @param facts - the finished-file count
 * @returns NO_FINISHED_FILE when there is no finished file, otherwise an empty list
 */
export function galleryDeliveryReasons(
  facts: GalleryDeliveryFacts,
): readonly FinalDeliveryReason[] {
  return facts.finishedCount === 0 ? ["NO_FINISHED_FILE"] : [];
}

/**
 * Which state the Owner's *Hasil akhir* card shows: completed, delivered, no finished file yet, or
 * ready. The gallery's state no longer changes the card (F-27, ADR-028).
 * @param facts - finished files, whether delivery is recorded, project status
 * @returns the card state
 */
export function deliveryCardState(facts: DeliveryCardFacts): DeliveryCardState {
  if (facts.projectStatus === "COMPLETED") return "COMPLETED";
  if (facts.published) return "DELIVERED";
  return facts.finishedCount === 0 ? "NO_FILES" : "READY";
}
