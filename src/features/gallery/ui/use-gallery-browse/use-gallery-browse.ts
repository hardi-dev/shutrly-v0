"use client";

import { useRef, useState } from "react";

import type { BrowseCursor } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { BrowseLocation } from "../browse-text/browse-text.types";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { BrowseState, UseGalleryBrowseInput } from "./use-gallery-browse.types";

const SEARCH_DEBOUNCE_MS = 300;
export const BROWSE_START: BrowseLocation = { kind: "PROOF", sourceId: null, path: "", search: "" };

async function fetchPage(
  input: Readonly<UseGalleryBrowseInput>,
  location: BrowseLocation,
  cursor: BrowseCursor | null,
): Promise<BrowsePageView | null> {
  try {
    return await input.browseAction(input.workspaceId, input.galleryId, { ...location, cursor });
  } catch {
    showToast({
      tone: "danger",
      title: GALLERY_COPY.browseFailedTitle,
      body: GALLERY_COPY.saveFailedBody,
    });
    return null;
  }
}

/** Drives *Semua foto*: tabs, folders, the breadcrumb, debounced search and infinite scroll; stale answers are dropped (A-12, A-13, AC-GAL-028…030). @param input - ids and the browse action @returns the state and handlers */
export function useGalleryBrowse(input: Readonly<UseGalleryBrowseInput>) {
  const [state, setState] = useState<BrowseState>({
    location: BROWSE_START,
    page: null,
    photos: [],
    isLoading: false,
    isLoadingMore: false,
  });
  const [searchText, setSearchText] = useState("");
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const go = async (location: BrowseLocation) => {
    request.current += 1;
    const mine = request.current;
    setState((current) => ({ ...current, location, isLoading: true, isLoadingMore: false }));
    const page = await fetchPage(input, location, null);
    if (mine !== request.current) return;
    if (page)
      setState({ location, page, photos: page.photos, isLoading: false, isLoadingMore: false });
    else setState((current) => ({ ...current, isLoading: false }));
  };
  const loadMore = async () => {
    const cursor = state.page?.nextCursor ?? null;
    if (cursor === null || state.isLoading || state.isLoadingMore) return;
    const mine = request.current;
    setState((current) => ({ ...current, isLoadingMore: true }));
    const next = await fetchPage(input, state.location, cursor);
    if (mine !== request.current) return;
    setState((current) =>
      next
        ? {
            ...current,
            page: next,
            photos: [...current.photos, ...next.photos],
            isLoadingMore: false,
          }
        : { ...current, isLoadingMore: false },
    );
  };
  const search = (text: string) => {
    setSearchText(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void go({ ...state.location, search: text.trim() });
    }, SEARCH_DEBOUNCE_MS);
  };
  return { state, searchText, go, loadMore, search, setSearchText };
}
