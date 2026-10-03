"use client";

import { useEffect, useState } from "react";

import type { ClientSearchState, UseClientSearchInput } from "./use-client-search.types";

export const CLIENT_SEARCH_DEBOUNCE_MS = 250;

/** Searches active clients for the project picker, waiting for the Owner to pause typing (D-11). @param input - workspace, query and the server action @returns the matches and whether a search is running */
export function useClientSearch(input: Readonly<UseClientSearchInput>): ClientSearchState {
  const { workspaceId, query, searchAction } = input;
  const [state, setState] = useState<ClientSearchState>({ items: [], isLoading: true });
  useEffect(() => {
    let isCurrent = true;
    const timer = window.setTimeout(() => {
      setState((previous) => ({ ...previous, isLoading: true }));
      searchAction(workspaceId, query)
        .then((items) => {
          if (isCurrent) setState({ items, isLoading: false });
        })
        .catch(() => {
          if (isCurrent) setState((previous) => ({ ...previous, isLoading: false }));
        });
    }, CLIENT_SEARCH_DEBOUNCE_MS);
    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [workspaceId, query, searchAction]);
  return state;
}
