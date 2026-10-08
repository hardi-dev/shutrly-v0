"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type { SetPicksResult } from "@/features/gallery/application/use-cases/set-picks/set-picks.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { CLIENT_BROWSE_COPY as COPY } from "../client-browse-screen/client-browse-screen.copy";
import { useSequentialDownload } from "../use-sequential-download/use-sequential-download";
import type { DownloadItem } from "../use-sequential-download/use-sequential-download.types";
import type { ProofDownloads, ProofDownloadsInput } from "./use-proof-downloads.types";

function pickToast(result: SetPicksResult, groupName: string): void {
  if (result.ok) {
    showToast({ tone: "success", title: COPY.pickedTitle(result.added, groupName) });
  } else if (result.code === "LIMIT_REACHED") {
    showToast({
      tone: "warning",
      title: COPY.pickLimitTitle,
      body: COPY.pickLimitBody(result.remaining),
    });
  } else if (result.code === "GROUP_NOT_OPEN")
    showToast({ tone: "warning", title: COPY.pickClosed });
  else showToast({ tone: "danger", title: COPY.pickRefused });
}

function useSelection() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlyMap<string, string>>(new Map());
  const stopSelecting = () => {
    setIsSelecting(false);
    setSelected(new Map());
  };
  const toggle = (photo: ClientPhotoView, isSelected: boolean) => {
    setSelected((current) => {
      const next = new Map(current);
      if (isSelected) next.set(photo.id, photo.fileName);
      else next.delete(photo.id);
      return next;
    });
  };
  const startSelecting = () => {
    setIsSelecting(true);
  };
  return { isSelecting, selected, toggle, startSelecting, stopSelecting };
}

/** *Unduh semua*: lists every proof, then waits for the confirm (F-20). */
function useDownloadAll(input: Readonly<ProofDownloadsInput>) {
  const router = useRouter();
  const [pendingAll, setPendingAll] = useState<readonly DownloadItem[] | null>(null);
  const [isListing, setIsListing] = useState(false);
  const ask = async () => {
    setIsListing(true);
    const files = await input.actions.listDownloads().catch(() => null);
    setIsListing(false);
    if (files === null)
      showToast({ tone: "danger", title: COPY.failedTitle, body: COPY.failedBody });
    else if ("kind" in files) router.refresh();
    else
      setPendingAll(
        files.map((file) => ({ id: file.id, url: file.downloadUrl, fileName: file.fileName })),
      );
  };
  return { pendingAll, setPendingAll, isListing, ask };
}

/** *Pilih untuk…* on the selection; it ends select mode and re-reads the groups once picked (F-20). */
function usePickSelected(
  input: Readonly<ProofDownloadsInput>,
  selection: ReturnType<typeof useSelection>,
) {
  const router = useRouter();
  const [isPicking, setIsPicking] = useState(false);
  const pick = async (groupId: string, groupName: string) => {
    setIsPicking(true);
    const photoIds = [...selection.selected.keys()];
    const result = await input.actions.setPicks({ groupId, photoIds }).catch(() => null);
    setIsPicking(false);
    if (result === null) showToast({ tone: "danger", title: COPY.pickRefused });
    else if ("kind" in result) router.refresh();
    else {
      pickToast(result, groupName);
      if (result.ok) {
        selection.stopSelecting();
        await input.onPicked();
      }
    }
  };
  return { isPicking, pick };
}

/**
 * *Semua foto* downloads and bulk picks (F-20, Owner 2026-10-07): one photo, the selected ones or
 * every proof as originals, one by one with progress; and *Pilih untuk…* on the selection, refused
 * as a whole past the group's limit.
 * @param input - the token, the actions and the reload after a pick
 * @returns the selection, download and pick state with handlers
 */
export function useProofDownloads(input: Readonly<ProofDownloadsInput>): ProofDownloads {
  const selection = useSelection();
  const download = useSequentialDownload();
  const all = useDownloadAll(input);
  const picking = usePickSelected(input, selection);
  const [names, setNames] = useState<ReadonlyMap<string, string>>(new Map());
  const downloadUrlOf = (photoId: string) => `/g/${input.token}/download/${photoId}`;
  const start = (items: readonly DownloadItem[]) => {
    setNames(new Map(items.map((item) => [item.id, item.fileName])));
    download.start(items);
  };
  const failed = new Set(download.progress.failedIds);
  return {
    isSelecting: selection.isSelecting,
    selectedCount: selection.selected.size,
    isSelected: (photoId) => selection.selected.has(photoId),
    toggle: selection.toggle,
    startSelecting: selection.startSelecting,
    stopSelecting: selection.stopSelecting,
    downloadUrlOf,
    downloadSelected: () => {
      start(
        [...selection.selected].map(([id, fileName]) => ({ id, url: downloadUrlOf(id), fileName })),
      );
      selection.stopSelecting();
    },
    pendingAll: all.pendingAll,
    isListing: all.isListing,
    askDownloadAll: () => void all.ask(),
    closeConfirm: () => {
      all.setPendingAll(null);
    },
    downloadAll: () => {
      if (all.pendingAll) start(all.pendingAll);
      all.setPendingAll(null);
    },
    isPicking: picking.isPicking,
    pickSelected: (groupId, groupName) => void picking.pick(groupId, groupName),
    download,
    failedNames: [...names].filter(([id]) => failed.has(id)).map(([, name]) => name),
  };
}
