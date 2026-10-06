"use client";

import { useCallback, useRef, useState } from "react";

import { saveBlob } from "./save-blob";
import type {
  DownloadItem,
  DownloadProgress,
  SequentialDownload,
  SequentialDownloadOptions,
} from "./use-sequential-download.types";

const IDLE: DownloadProgress = { phase: "IDLE", done: 0, total: 0, failedIds: [] };

const isAborted = (abort: AbortController): boolean => abort.signal.aborted;

async function fetchOne(
  item: DownloadItem,
  signal: AbortSignal,
  options: Required<SequentialDownloadOptions>,
): Promise<boolean> {
  try {
    const response = await options.fetchFn(item.url, { signal, credentials: "same-origin" });
    if (!response.ok) return false;
    options.save(await response.blob(), item.fileName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads files one at a time as blobs and saves each, so the page can show *n dari m*, offer
 * *Batalkan*, mark a failed file *Gagal* and retry the failures (D-18, A-33, AC-DEL-003, -005).
 * @param options - injectable fetch and save, for tests
 * @returns the progress and the controls
 */
export function useSequentialDownload(options: SequentialDownloadOptions = {}): SequentialDownload {
  const [progress, setProgress] = useState<DownloadProgress>(IDLE);
  const controller = useRef<AbortController | null>(null);
  const lastItems = useRef<readonly DownloadItem[]>([]);
  const fetchFn = options.fetchFn ?? fetch;
  const save = options.save ?? saveBlob;

  const run = useCallback(
    async (items: readonly DownloadItem[]) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      lastItems.current = items;
      const failedIds: string[] = [];
      setProgress({ phase: "RUNNING", done: 0, total: items.length, failedIds });
      for (const [index, item] of items.entries()) {
        if (isAborted(abort)) return;
        if (!(await fetchOne(item, abort.signal, { fetchFn, save }))) failedIds.push(item.id);
        // Batalkan may have come in while this file was downloading.
        if (isAborted(abort)) return;
        setProgress({
          phase: "RUNNING",
          done: index + 1,
          total: items.length,
          failedIds: [...failedIds],
        });
      }
      setProgress({ phase: "DONE", done: items.length, total: items.length, failedIds });
    },
    [fetchFn, save],
  );

  return {
    progress,
    start: (items) => {
      void run(items);
    },
    cancel: () => {
      controller.current?.abort();
      setProgress((current) => ({ ...current, phase: "CANCELLED" }));
    },
    retry: () => {
      const failed = new Set(progress.failedIds);
      void run(lastItems.current.filter((item) => failed.has(item.id)));
    },
    reset: () => {
      controller.current?.abort();
      setProgress(IDLE);
    },
  };
}
