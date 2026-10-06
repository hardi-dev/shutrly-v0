"use client";

import { useState } from "react";

import type {
  DeliveryFilesView,
  DeliveryFileView,
} from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files.types";

import { useFileSelection } from "../use-file-selection/use-file-selection";
import { useSequentialDownload } from "../use-sequential-download/use-sequential-download";
import type { DownloadItem } from "../use-sequential-download/use-sequential-download.types";
import type { DeliveryKind, DeliveryScreenState } from "./use-delivery-screen.types";

const toItem = (file: DeliveryFileView): DownloadItem => ({
  id: file.id,
  url: file.downloadUrl,
  fileName: file.fileName,
});

const filesOf = (files: DeliveryFilesView, kind: DeliveryKind) =>
  kind === "EDITED" ? files.edited : files.print;

/**
 * The *Hasil akhir* page's state: the open kind, *Pilih beberapa* mode, the *Unduh semua* confirm,
 * the preview and the sequential download (klien-8, A-33, AC-DEL-003, -005).
 * @param files - the finished files by kind
 * @returns the state and handlers
 */
export function useDeliveryScreen(files: DeliveryFilesView): DeliveryScreenState {
  const [kind, setKind] = useState<DeliveryKind>(
    files.edited.length > 0 || files.print.length === 0 ? "EDITED" : "PRINT",
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const selection = useFileSelection();
  const download = useSequentialDownload();
  const shown = filesOf(files, kind);
  const all = [...files.edited, ...files.print];
  const failed = new Set(download.progress.failedIds);
  return {
    files,
    kind,
    setKind: (next) => {
      selection.stopSelecting();
      setKind(next);
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
