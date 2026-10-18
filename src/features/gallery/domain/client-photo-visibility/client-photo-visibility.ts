import type { ClientPhotoFacts } from "./client-photo-visibility.types";

/**
 * Whether *Semua foto* lists a photo: visible proofs only (BR-DEL-002, BR-GAL-006, D-15).
 * @param photo - kind, missing and source facts
 * @returns true for a present proof of a linked source
 */
export function isInAllPhotos(photo: ClientPhotoFacts): boolean {
  return photo.kind === "PROOF" && !photo.isMissing && !photo.isSourceRemoved;
}

/**
 * Whether *Hasil akhir* lists a photo: a present edited or print file, visible as soon as a
 * sync finds it, with no publish step (BR-DEL-002, AC-GFL-019).
 * @param photo - kind, missing and source facts
 * @returns true for a present finished file of a linked source
 */
export function isInFinalDelivery(photo: ClientPhotoFacts): boolean {
  return photo.kind !== "PROOF" && !photo.isMissing && !photo.isSourceRemoved;
}

/**
 * Whether the client media route may serve a photo (BR-ACC-005, AC-ACC-013, AC-GFL-019).
 * @param photo - kind, missing and source facts
 * @returns true when the client can see it somewhere
 */
export function isServableToClient(photo: ClientPhotoFacts): boolean {
  return isInAllPhotos(photo) || isInFinalDelivery(photo);
}
