import type { PhotoKind } from "../photo-classification/photo-classification.types";
import type { ClientPhotoFacts } from "./client-photo-visibility.types";

/** Whether *Semua foto* lists a photo: visible proofs only (BR-DEL-002, BR-GAL-006, D-15). @param photo - kind, missing and source facts @returns true for a present proof of a linked source */
export function isInAllPhotos(photo: ClientPhotoFacts): boolean {
  return photo.kind === "PROOF" && !photo.isMissing && !photo.isSourceRemoved;
}

/** Whether *Hasil akhir* lists a photo: edited and print files after final delivery (BR-DEL-001/002). @param photo - kind, missing and source facts @param finalDeliveryPublished - whether the Owner published final delivery @returns true for a present final file once delivered */
export function isInFinalDelivery(
  photo: ClientPhotoFacts,
  finalDeliveryPublished: boolean,
): boolean {
  return (
    finalDeliveryPublished && photo.kind !== "PROOF" && !photo.isMissing && !photo.isSourceRemoved
  );
}

/** Whether the client media route may serve a photo (BR-ACC-005, AC-ACC-013). @param photo - kind, missing and source facts @param finalDeliveryPublished - whether final delivery is published @returns true when the client can see it somewhere */
export function isServableToClient(
  photo: ClientPhotoFacts,
  finalDeliveryPublished: boolean,
): boolean {
  return isInAllPhotos(photo) || isInFinalDelivery(photo, finalDeliveryPublished);
}

/** Which kind a client's browse query may read: EDITED or PRINT only after final delivery, PROOF otherwise (BR-DEL-002, D-15). @param requested - the kind the page asked for @param finalDeliveryPublished - whether the Owner published final delivery @returns the kind to read */
export function clientBrowseKind(requested: PhotoKind, finalDeliveryPublished: boolean): PhotoKind {
  return requested !== "PROOF" && finalDeliveryPublished ? requested : "PROOF";
}
