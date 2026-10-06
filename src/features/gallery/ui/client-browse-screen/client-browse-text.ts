import type { ClientBrowseState } from "../use-client-browse/use-client-browse.types";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";

/** The *Foto* card's meta: total proofs and folders at the root, the folder's count inside one, hits while searching (klien-3 exports). @param state - browse state @returns the meta line */
export function browseCardMeta(state: ClientBrowseState): string {
  const page = state.page;
  if (!page) return "";
  if (page.mode === "SEARCH") return COPY.searchMeta(page.summary?.photoCount ?? 0);
  const name = state.location.trail.at(-1);
  if (name !== undefined) return COPY.folderMeta(name, page.summary?.photoCount ?? 0);
  return COPY.cardMeta(page.proofTotal, page.summary?.folderCount ?? page.folders.length);
}

/** The line above the grid: the root summary, or the search summary (klien-3 exports). @param state - browse state @returns the summary, or null inside a folder (the trail shows instead) */
export function browseSummary(state: ClientBrowseState): string | null {
  const page = state.page;
  if (!page || state.location.trail.length > 0) return null;
  if (page.mode === "SEARCH") {
    return COPY.searchSummary(page.summary?.photoCount ?? 0, state.location.search);
  }
  const folders = page.summary?.folderCount ?? page.folders.length;
  const photos = page.summary?.photoCount ?? 0;
  return COPY.rootSummary(folders, photos);
}
