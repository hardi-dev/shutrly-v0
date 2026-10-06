import type { GalleryProjectStatus, GalleryStatus } from "../gallery-status/gallery-status.types";
import type { AccessCardState } from "./access-card.types";

const MASK = "••••••••";
const VISIBLE_TAIL = 4;

/**
 * Which state the *Akses klien* card shows: inactive once the gallery is archived or the project
 * cancelled (no link, no *Ganti link*), draft before publishing, active otherwise (aksesklien-kartu).
 * @param gallery - the gallery's effective status
 * @param project - the project's status
 * @returns the card state
 */
export function accessCardState(
  gallery: GalleryStatus,
  project: GalleryProjectStatus,
): AccessCardState {
  if (gallery === "ARCHIVED" || project === "CANCELLED") return "INACTIVE";
  return gallery === "DRAFT" ? "DRAFT" : "ACTIVE";
}

/** The link as the card shows it, e.g. "shutrly.app/g/••••••••3kQ9": the host and the token's last 4 characters (aksesklien-kartu). @param host - the app host, without scheme @param token - the client token @returns the masked link */
export function maskedClientLink(host: string, token: string): string {
  return `${host}/g/${MASK}${token.slice(-VISIBLE_TAIL)}`;
}
