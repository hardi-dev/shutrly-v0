"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { USE_LOAD_MORE_CLIENTS_COPY_NAMESPACE } from "./use-load-more-clients.copy";
import type { UseLoadMoreClientsProps } from "./use-load-more-clients.types";

/** Appends the next keyset page while preserving already rendered client rows. */
export function useLoadMoreClients({
  workspaceId,
  status,
  q,
  initial,
  action,
}: Readonly<UseLoadMoreClientsProps>) {
  const t = useTranslations(USE_LOAD_MORE_CLIENTS_COPY_NAMESPACE);
  const [page, setPage] = useState(initial);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const reset = window.setTimeout(() => {
      setPage(initial);
      setLoading(false);
    });
    return () => {
      window.clearTimeout(reset);
    };
  }, [initial]);
  async function loadMore(): Promise<void> {
    if (loading || !page.nextCursor || !action) return;
    setLoading(true);
    try {
      const next = await action(workspaceId, { status, q, afterId: page.nextCursor });
      setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor });
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        body: t("serverErrorBody"),
      });
    } finally {
      setLoading(false);
    }
  }
  return { rows: page.items, hasMore: page.nextCursor !== null, isLoading: loading, loadMore };
}
