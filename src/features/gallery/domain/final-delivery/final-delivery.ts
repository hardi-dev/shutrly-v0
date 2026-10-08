import type {
  DeliveryCardFacts,
  DeliveryCardState,
  FinalDeliveryReason,
  GalleryDeliveryFacts,
} from "./final-delivery.types";

/**
 * The gallery's reasons to refuse final delivery: no synced finished file, or a gallery that isn't
 * published (missing, draft, expired or archived) (BR-DEL-003, A-17, AC-DEL-002). Every reason is
 * returned, in the order the refusal dialog lists them.
 * @param facts - effective gallery status and the finished-file count
 * @returns the reasons, empty when the gallery side allows publishing
 */
export function galleryDeliveryReasons(
  facts: GalleryDeliveryFacts,
): readonly FinalDeliveryReason[] {
  const reasons: FinalDeliveryReason[] = [];
  if (facts.finishedCount === 0) reasons.push("NO_FINISHED_FILE");
  if (facts.status !== "PUBLISHED") reasons.push("GALLERY_NOT_PUBLISHED");
  return reasons;
}

/**
 * Which state the Owner's *Hasil akhir* card shows: completed, published, gallery not active, no
 * finished file yet, or ready (hasilakhirowner-kartu states A–E).
 * @param facts - gallery status, finished files, whether delivery is published, project status
 * @returns the card state
 */
export function deliveryCardState(facts: DeliveryCardFacts): DeliveryCardState {
  if (facts.projectStatus === "COMPLETED") return "COMPLETED";
  if (facts.published) return "PUBLISHED";
  if (facts.status !== "PUBLISHED") return "GALLERY_INACTIVE";
  return facts.finishedCount === 0 ? "NO_FILES" : "READY";
}
