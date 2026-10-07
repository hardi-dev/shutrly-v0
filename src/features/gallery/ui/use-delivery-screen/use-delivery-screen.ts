"use client";

import { useState } from "react";

import type {
  DeliveryFilesView,
  DeliveryFileView,
} from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files.types";

import { useFileSelection } from "../use-file-selection/use-file-selection";
import { useSequentialDownload } from "../use-sequential-download/use-sequential-download";
import type { DownloadItem } from "../use-sequential-download/use-sequential-download.types";
import type { DeliveryScreenState } from "./use-delivery-screen.types";

const toItem = (file: DeliveryFileView): DownloadItem => ({
  id: file.id,
  url: file.downloadUrl,
  fileName: file.fileName,
});

/**
 * The *Hasil akhir* page's state: the open item tab (F-20), *Pilih beberapa* mode, the *Unduh semua* confirm,
 * the preview and the sequential download (klien-8, A-33, AC-DEL-003, -005).
 * @param files - the finished files per item
 * @returns the state and handlers
 */
export function useDeliveryScreen(files: DeliveryFilesView): DeliveryScreenState {
  const [groupId, setGroupId] = useState(files.groups.at(0)?.id ?? "");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const selection = useFileSelection();
  const download = useSequentialDownload();
  const group = files.groups.find((candidate) => candidate.id === groupId) ?? files.groups.at(0);
  const shown = group?.files ?? [];
  const all = files.groups.flatMap((candidate) => candidate.files);
  const failed = new Set(download.progress.failedIds);
  return {
    files,
    groupId: group?.id ?? "",
    groupName: group?.name ?? "",
    setGroupId: (next) => {
      selection.stopSelecting();
      setGroupId(next);
    },
    shown,
    ...selection,
    downloadSelected: () => {
      download.start(shown.filter((file) => selection.selectedIds.has(file.id)).map(toItem));
      selection.stopSelecting();
    },
    isConfirmOpen,
    askDownloadAll: () => {
      setIsConfirmOpen(true);
    },
    closeConfirm: () => {
      setIsConfirmOpen(false);
    },
    downloadAll: () => {
      setIsConfirmOpen(false);
      download.start(shown.map(toItem));
    },
    viewerIndex,
    setViewerIndex,
    download,
    failedNames: all.filter((file) => failed.has(file.id)).map((file) => file.fileName),
  };
}
