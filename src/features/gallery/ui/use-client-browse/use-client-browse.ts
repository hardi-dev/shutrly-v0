"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { BrowseCursor } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";

import type {
  ClientBrowseAction,
  ClientBrowseHandle,
  ClientBrowseLocation,
  ClientBrowseState,
} from "./use-client-browse.types";

const SEARCH_DEBOUNCE_MS = 300;
export const CLIENT_BROWSE_START: ClientBrowseLocation = {
  sourceId: null,
  path: "",
  search: "",
  trail: [],
};

type FetchOutcome = ClientBrowsePageView | "SIGNED_OUT" | "FAILED";

async function fetchPage(
  action: ClientBrowseAction,
  location: ClientBrowseLocation,
  cursor: BrowseCursor | null,
): Promise<FetchOutcome> {
  try {
    const { sourceId, path, search } = location;
    const page = await action({ kind: "PROOF", sourceId, path, search, cursor });
    return "kind" in page ? "SIGNED_OUT" : page;
  } catch {
    return "FAILED";
  }
}

/** The state before any browse: the server's first page, or the failed state when it couldn't load. @param initialPage - the root page from the server @returns the state */
export function initialBrowseState(initialPage: ClientBrowsePageView | null): ClientBrowseState {
  return {
    location: CLIENT_BROWSE_START,
    page: initialPage,
    photos: initialPage?.photos ?? [],
    isLoading: false,
    isLoadingMore: false,
    hasFailed: initialPage === null,
  };
}

function appendPage(current: ClientBrowseState, next: FetchOutcome): ClientBrowseState {
  if (typeof next === "string") return { ...current, isLoadingMore: false };
  return {
    ...current,
    // Later pages carry photos only: keep the first page's folders and counts.
    page: current.page ? { ...current.page, nextCursor: next.nextCursor } : next,
    photos: [...current.photos, ...next.photos],
    isLoadingMore: false,
  };
}

/** Drives the client's *Semua foto*: folders, the in-card trail, debounced search, infinite scroll and the failed state with retry; stale answers are dropped (A-12, A-13, D-15). @param action - the browse server action @param initialPage - the root page loaded by the server @returns the state and handlers */
export function useClientBrowse(
  action: ClientBrowseAction,
  initialPage: ClientBrowsePageView | null,
): ClientBrowseHandle {
  const router = useRouter();
  const [state, setState] = useState<ClientBrowseState>(() => initialBrowseState(initialPage));
  const [searchText, setSearchText] = useState("");
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const go = async (location: ClientBrowseLocation) => {
    request.current += 1;
    const mine = request.current;
    setState((current) => ({ ...current, location, isLoading: true, hasFailed: false }));
    const outcome = await fetchPage(action, location, null);
    if (mine !== request.current) return;
    if (outcome === "SIGNED_OUT") router.refresh();
    else if (outcome === "FAILED") {
      setState((current) => ({ ...current, isLoading: false, hasFailed: true }));
    } else setState({ ...initialBrowseState(outcome), location });
  };
  const loadMore = async () => {
    const cursor = state.page?.nextCursor ?? null;
    if (cursor === null || state.isLoading || state.isLoadingMore) return;
    const mine = request.current;
    setState((current) => ({ ...current, isLoadingMore: true }));
    const next = await fetchPage(action, state.location, cursor);
    if (mine === request.current) setState((current) => appendPage(current, next));
  };
  const search = (text: string) => {
    setSearchText(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void go({ ...CLIENT_BROWSE_START, search: text.trim() });
    }, SEARCH_DEBOUNCE_MS);
  };
  return { state, searchText, go, loadMore, search };
}
