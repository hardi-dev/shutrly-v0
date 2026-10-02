"use client";

import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { UseLoadMoreClientsProps } from "./use-load-more-clients.types";

/** Appends the next keyset page while preserving already rendered client rows. */
export function useLoadMoreClients({
  workspaceId,
  status,
  q,
  initial,
  action,
}: Readonly<UseLoadMoreClientsProps>) {
  const [page, setPage] = useState(initial);
  const [loading, setLoading] = useState(false);
  async function loadMore(): Promise<void> {
    if (loading || !page.nextCursor || !action) return;
    setLoading(true);
    try {
      const next = await action(workspaceId, { status, q, afterId: page.nextCursor });
      setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor });
    } catch {
      showToast({
        tone: "danger",
        title: CLIENT_COPY.serverErrorTitle,
        body: CLIENT_COPY.serverErrorBody,
      });
    } finally {
      setLoading(false);
    }
  }
  return { rows: page.items, hasMore: page.nextCursor !== null, isLoading: loading, loadMore };
}
