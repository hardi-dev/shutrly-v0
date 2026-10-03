"use client";

import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { UseLoadMoreProjectsProps } from "./use-load-more-projects.types";

/** Appends the next keyset page and resets when the server sends new data (tab, search or refresh) (AC-PRJ-005). */
export function useLoadMoreProjects({
  workspaceId,
  tab,
  q,
  initial,
  action,
}: Readonly<UseLoadMoreProjectsProps>) {
  const [page, setPage] = useState(initial);
  const [seenInitial, setSeenInitial] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);
  // New server data replaces the appended pages during render, not in an effect.
  if (seenInitial !== initial) {
    setSeenInitial(initial);
    setPage(initial);
    setIsLoading(false);
  }
  const loadMore = async (): Promise<void> => {
    if (isLoading || !page.nextCursor || !action) return;
    setIsLoading(true);
    try {
      const next = await action(workspaceId, { tab, q, afterId: page.nextCursor });
      setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor });
    } catch {
      showToast({
        tone: "danger",
        title: PROJECT_COPY.serverErrorTitle,
        body: PROJECT_COPY.serverErrorBody,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return { rows: page.items, hasMore: page.nextCursor !== null, isLoading, loadMore };
}
