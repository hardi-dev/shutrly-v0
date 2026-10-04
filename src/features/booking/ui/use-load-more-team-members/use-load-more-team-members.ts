"use client";

import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import type { UseLoadMoreTeamMembersProps } from "./use-load-more-team-members.types";

/**
 * Appends the next keyset page to the rows the server rendered (A-3, D-7).
 * A fresh server render (a new `initial`) starts over from its first page.
 * @param props - the workspace, the tab, the query, the first page and the load-more action
 * @returns the rows so far, whether there is more, whether a load is running and `loadMore`
 */
export function useLoadMoreTeamMembers({
  workspaceId,
  status,
  q,
  initial,
  action,
}: Readonly<UseLoadMoreTeamMembersProps>) {
  const [page, setPage] = useState(initial);
  const [seen, setSeen] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);
  if (seen !== initial) {
    setSeen(initial);
    setPage(initial);
  }
  async function loadMore(): Promise<void> {
    if (isLoading || !page.nextCursor) return;
    setIsLoading(true);
    try {
      const next = await action(workspaceId, { status, q, afterId: page.nextCursor });
      setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor });
    } catch {
      showToast({
        tone: "danger",
        title: TEAM_COPY.serverErrorTitle,
        action: { label: TEAM_COPY.retry, onAction: () => void loadMore() },
      });
    } finally {
      setIsLoading(false);
    }
  }
  return { rows: page.items, hasMore: page.nextCursor !== null, isLoading, loadMore };
}
