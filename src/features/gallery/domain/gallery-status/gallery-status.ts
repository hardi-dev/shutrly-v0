import type {
  GalleryProjectStatus,
  GalleryStatus,
  GalleryStoredStatus,
} from "./gallery-status.types";

export const GALLERY_STORED_STATUSES: readonly GalleryStoredStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];
export const GALLERY_PROJECT_STATUSES: readonly GalleryProjectStatus[] = [
  "DRAFT",
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];
const GALLERY_PROJECT_ALLOWED: readonly GalleryProjectStatus[] = [
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
];
const OPEN_STATUSES: readonly GalleryStatus[] = ["DRAFT", "PUBLISHED", "EXPIRED"];

/** Derives the status every reader sees: a published gallery past its expiry is EXPIRED (BR-GAL-005, A-7, D-1). @param stored - the stored status @param expiresAt - the expiry instant or null @param now - the current instant @returns the effective status */
export function effectiveGalleryStatus(
  stored: GalleryStoredStatus,
  expiresAt: Date | null,
  now: Date,
): GalleryStatus {
  if (stored !== "PUBLISHED" || expiresAt === null) return stored;
  return expiresAt.getTime() <= now.getTime() ? "EXPIRED" : "PUBLISHED";
}

/** Tells whether a project may have a gallery created for it (BR-GAL-009, AC-GAL-003). @param projectStatus - the project status @returns true from BOOKED on, except CANCELLED */
export function galleryAllowedForProject(projectStatus: GalleryProjectStatus): boolean {
  return GALLERY_PROJECT_ALLOWED.includes(projectStatus);
}

function isOpen(status: GalleryStatus, projectStatus: GalleryProjectStatus): boolean {
  return OPEN_STATUSES.includes(status) && projectStatus !== "CANCELLED";
}

/** Tells whether a source may be synced (BR-GAL-009, AC-GAL-022, AC-GAL-024). @param status - effective gallery status @param projectStatus - the project status @returns false once archived or on a cancelled project */
export function canSync(status: GalleryStatus, projectStatus: GalleryProjectStatus): boolean {
  return isOpen(status, projectStatus);
}

/** Tells whether sources may be added or removed (BR-GAL-009, AC-GAL-022, AC-GAL-024). @param status - effective gallery status @param projectStatus - the project status @returns false once archived or on a cancelled project */
export function canEditSources(
  status: GalleryStatus,
  projectStatus: GalleryProjectStatus,
): boolean {
  return isOpen(status, projectStatus);
}

/** Tells whether the gallery may be published (BR-GAL-004, AC-GAL-024). @param status - effective gallery status @param projectStatus - the project status @returns true only for a draft on a live project */
export function canPublish(status: GalleryStatus, projectStatus: GalleryProjectStatus): boolean {
  return status === "DRAFT" && projectStatus !== "CANCELLED";
}

/** Tells whether the expiry may change (BR-GAL-005, AC-GAL-022). @param status - effective gallery status @param projectStatus - the project status @returns true for draft, published and expired on a live project */
export function canSetExpiry(status: GalleryStatus, projectStatus: GalleryProjectStatus): boolean {
  return isOpen(status, projectStatus);
}

/** Tells whether the password may be rotated (BR-GAL-003, AC-GAL-022). @param status - effective gallery status @param projectStatus - the project status @returns true for draft, published and expired on a live project */
export function canRotatePassword(
  status: GalleryStatus,
  projectStatus: GalleryProjectStatus,
): boolean {
  return isOpen(status, projectStatus);
}

/** Tells whether the Owner may archive the gallery (BR-GAL-005). @param status - effective gallery status @returns true for published and expired */
export function canArchive(status: GalleryStatus): boolean {
  return status === "PUBLISHED" || status === "EXPIRED";
}

/** Tells whether the gallery may be deleted (BR-GAL-005, A-10, AC-GAL-023). @param status - effective gallery status @returns true only for a draft */
export function canDeleteDraft(status: GalleryStatus): boolean {
  return status === "DRAFT";
}
