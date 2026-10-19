// The F-07 project statuses, restated because a feature never imports another (D-14).
export type GalleryProjectStatus =
  "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";

/** A gallery's state, derived on every read and never stored (BR-GAL-005, D-1). */
export type GalleryState = "OPEN" | "EXPIRED" | "CLOSED";

export interface ShareGalleryInput {
  readonly projectStatus: GalleryProjectStatus;
  readonly state: GalleryState;
  readonly activeSourceCount: number;
}
