import {
  canArchive,
  canDeleteDraft,
  canPublish,
  canRotatePassword,
  canSetExpiry,
} from "./gallery-status";
import type { GalleryProjectStatus, GalleryStatus } from "./gallery-status.types";

export type GalleryAction = "PUBLISH" | "CHANGE_EXPIRY" | "ROTATE_PASSWORD" | "ARCHIVE" | "DELETE";

export interface GalleryHeaderActions {
  /** The primary button, or null (design.md › Layout: Draft *Publikasikan*, Expired *Ubah kedaluwarsa*, cancelled *Hapus galeri*). */
  readonly primary: GalleryAction | null;
  /** The ⋯ menu entries, in order. */
  readonly menu: readonly GalleryAction[];
}

/** Decides the header actions of a gallery by state, from the same guards the server enforces (BR-GAL-003…005, AC-GAL-022, AC-GAL-024). @param status - effective gallery status @param projectStatus - the project status @returns the primary action and the menu */
export function galleryHeaderActions(
  status: GalleryStatus,
  projectStatus: GalleryProjectStatus,
): GalleryHeaderActions {
  if (projectStatus === "CANCELLED") {
    return { primary: canDeleteDraft(status) ? "DELETE" : null, menu: [] };
  }
  const menu: GalleryAction[] = [];
  if (canSetExpiry(status, projectStatus) && status !== "EXPIRED") menu.push("CHANGE_EXPIRY");
  if (canRotatePassword(status, projectStatus)) menu.push("ROTATE_PASSWORD");
  if (canArchive(status)) menu.push("ARCHIVE");
  if (canDeleteDraft(status)) menu.push("DELETE");
  if (canPublish(status, projectStatus)) return { primary: "PUBLISH", menu };
  return { primary: status === "EXPIRED" ? "CHANGE_EXPIRY" : null, menu };
}
