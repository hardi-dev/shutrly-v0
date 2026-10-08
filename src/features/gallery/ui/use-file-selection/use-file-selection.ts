"use client";

import { useState } from "react";

import type { FileSelection } from "./use-file-selection.types";

/**
 * *Pilih beberapa*: whether the mode is on and which files are ticked (A-33).
 * @returns the mode, the ticked ids and the handlers
 */
export function useFileSelection(): FileSelection {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const stopSelecting = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };
  const toggle = (id: string, isSelected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  return {
    isSelecting,
    selectedIds,
    toggle,
    stopSelecting,
    startSelecting: () => {
      setIsSelecting(true);
    },
  };
}
