export type GalleryStoredStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type GalleryStatus = GalleryStoredStatus | "EXPIRED";
// The F-07 project statuses, restated because a feature never imports another (D-14).
export type GalleryProjectStatus =
  "DRAFT" | "BOOKED" | "SHOOTING" | "POST_PROCESSING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
