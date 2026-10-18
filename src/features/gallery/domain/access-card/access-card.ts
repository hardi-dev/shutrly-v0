import type { GalleryState } from "../gallery-state/gallery-state.types";
import type { AccessCardState } from "./access-card.types";

const MASK = "••••••••";
const VISIBLE_TAIL = 4;

/**
 * Which state the *Akses klien* card shows: inactive once the gallery is closed (its project was
 * cancelled), active otherwise, including an expired gallery that the Owner can reopen (BR-GAL-005).
 * @param state - the gallery's derived state
 * @returns the card state
 */
export function accessCardState(state: GalleryState): AccessCardState {
  return state === "CLOSED" ? "INACTIVE" : "ACTIVE";
}

/** The link as the card shows it, e.g. "shutrly.app/g/••••••••3kQ9": the host and the token's last 4 characters (aksesklien-kartu). @param host - the app host, without scheme @param token - the client token @returns the masked link */
export function maskedClientLink(host: string, token: string): string {
  return `${host}/g/${MASK}${token.slice(-VISIBLE_TAIL)}`;
}
