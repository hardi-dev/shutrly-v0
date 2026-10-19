import { galleryState, isGalleryProjectStatus } from "../gallery-state/gallery-state";
import type { AvailabilityInput } from "./client-gallery-availability.types";

/**
 * Whether a client may open this gallery at all (BR-ACC-001, BR-GAL-005, BR-PRJ-010).
 * There is no publish step: an open gallery is available once the project token and the
 * password are right (AC-GFL-008), so only the derived state decides. An unknown project
 * status fails closed.
 * @param input - stored project status, expiry and the clock
 * @returns true only when the derived gallery state is OPEN
 */
export function isAvailableToClient(input: AvailabilityInput): boolean {
  if (!isGalleryProjectStatus(input.projectStatus)) return false;
  return galleryState(input.projectStatus, input.expiresAt, input.now) === "OPEN";
}
