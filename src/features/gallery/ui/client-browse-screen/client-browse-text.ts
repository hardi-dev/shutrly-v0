import type { useTranslations } from "next-intl";

import type { ClientBrowseState } from "../use-client-browse/use-client-browse.types";

/** The client browse translate function, passed into helpers that run outside a component. */
export type BrowseTranslate = ReturnType<typeof useTranslations>;

/** The *Foto* card's meta: total proofs and folders at the root, the folder's count inside one, hits while searching (klien-3 exports). @param t - the browse translate function @param state - browse state @returns the meta line */
export function browseCardMeta(t: BrowseTranslate, state: ClientBrowseState): string {
  const page = state.page;
  if (!page) return "";
  if (page.mode === "SEARCH") return t("searchMeta", { count: page.summary?.photoCount ?? 0 });
  const name = state.location.trail.at(-1);
  if (name !== undefined) return t("folderMeta", { name, photos: page.summary?.photoCount ?? 0 });
  const folders = page.summary?.folderCount ?? page.folders.length;
  return folders > 0
    ? t("cardMetaFolders", { photos: page.proofTotal, folders })
    : t("cardMeta", { photos: page.proofTotal });
}

/** The gallery has no photos or folders to browse, outside a search: the page drops *Unduh*, the search field and the trail (klien-semua-foto-tanpa-foto). @param state - browse state @returns true when there is nothing to act on */
export function isBrowseEmpty(state: ClientBrowseState): boolean {
  const page = state.page;
  if (!page || state.hasFailed || page.mode === "SEARCH") return false;
  return page.proofTotal === 0 && page.folders.length === 0;
}

/** The line above the grid: the root summary, or the search summary (klien-3 exports). @param t - the browse translate function @param state - browse state @returns the summary, or null inside a folder (the trail shows instead) */
export function browseSummary(t: BrowseTranslate, state: ClientBrowseState): string | null {
  const page = state.page;
  if (!page || state.location.trail.length > 0) return null;
  if (page.mode === "SEARCH") {
    return t("searchSummary", {
      count: page.summary?.photoCount ?? 0,
      text: state.location.search,
    });
  }
  const folders = page.summary?.folderCount ?? page.folders.length;
  const photos = page.summary?.photoCount ?? 0;
  return t("rootSummary", { folders, photos });
}
