import type { GalleryState } from "./gallery-state.types";

/** The header actions a gallery page offers; PUBLISH, ARCHIVE and DELETE are gone with F-27 (AC-GFL-006). */
export type GalleryAction = "CHANGE_EXPIRY" | "ROTATE_PASSWORD";

export interface GalleryHeaderActions {
  /** The primary button, or null (design.md › Layout: expired *Ubah kedaluwarsa*). */
  readonly primary: GalleryAction | null;
  /** The ⋯ menu entries, in order. */
  readonly menu: readonly GalleryAction[];
}

/**
 * Decides the header actions of a gallery by its derived state (BR-GAL-003, BR-GAL-005, AC-GFL-006,
 * AC-GFL-012). A closed gallery offers nothing; an expired one leads with *Ubah kedaluwarsa*.
 * @param state - the derived gallery state
 * @returns the primary action and the menu
 */
export function galleryHeaderActions(state: GalleryState): GalleryHeaderActions {
  if (state === "CLOSED") return { primary: null, menu: [] };
  if (state === "EXPIRED") return { primary: "CHANGE_EXPIRY", menu: ["ROTATE_PASSWORD"] };
  return { primary: null, menu: ["CHANGE_EXPIRY", "ROTATE_PASSWORD"] };
}
