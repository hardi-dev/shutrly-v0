import type { GalleryProjectStatus, GalleryState, ShareGalleryInput } from "./gallery-state.types";

const PROJECT_STATUSES: readonly GalleryProjectStatus[] = [
  "DRAFT",
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const SHAREABLE_PROJECT_STATUSES: readonly GalleryProjectStatus[] = [
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
];

/**
 * Narrows a stored text value to a known project status. The column is check-constrained,
 * so an unknown value means a stale or corrupt row, which callers treat as closed.
 * @param value - the stored project status
 * @returns true when the value is one of the project statuses
 */
export function isGalleryProjectStatus(value: string): value is GalleryProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}

/**
 * Derives the gallery state from the project status and the expiry (BR-GAL-005, A-2, D-1).
 * CLOSED wins over EXPIRED: a cancelled project's gallery stays closed for good.
 * @param projectStatus - the owning project's status
 * @param expiresAt - the expiry instant, or null when the gallery never expires
 * @param now - the instant of the read
 * @returns OPEN, EXPIRED (expiry reached) or CLOSED (project cancelled)
 */
export function galleryState(
  projectStatus: GalleryProjectStatus,
  expiresAt: Date | null,
  now: Date,
): GalleryState {
  if (projectStatus === "CANCELLED") return "CLOSED";
  if (expiresAt !== null && expiresAt.getTime() <= now.getTime()) return "EXPIRED";
  return "OPEN";
}

/**
 * Tells whether the Owner may still change a gallery's sources, expiry or password (BR-GAL-005).
 * @param state - the derived gallery state
 * @returns false only for a CLOSED gallery
 */
export function isWritable(state: GalleryState): boolean {
  return state !== "CLOSED";
}

/**
 * Tells whether the Owner may share the gallery link with the client (BR-GAL-010).
 * @param input - project status, derived gallery state and the number of active sources
 * @returns true for an open gallery with at least one active source on a booked-or-later project
 */
export function canShareGallery(input: ShareGalleryInput): boolean {
  return (
    SHAREABLE_PROJECT_STATUSES.includes(input.projectStatus) &&
    input.state === "OPEN" &&
    input.activeSourceCount >= 1
  );
}
