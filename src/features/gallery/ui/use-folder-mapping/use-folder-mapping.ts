"use client";

import { useEffect, useState } from "react";

import type { FolderMappingView } from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping.types";

import type { FolderMappingState, UseFolderMappingInput } from "./use-folder-mapping.types";

/**
 * The folder *Edit*'s subfolder mapping (F-21), one subfolder per package item (Owner 2026-10-07): loads the subfolders, the package's selection items
 * and the saved mapping when the dialog opens, and keeps the Owner's choices until saved.
 * @param input - ids and the load action
 * @returns the view, the choices and what to save
 */
export function useFolderMapping(input: Readonly<UseFolderMappingInput>): FolderMappingState {
  const { workspaceId, sourceId, folderMappingAction } = input;
  const [view, setView] = useState<FolderMappingView | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [choices, setChoices] = useState<ReadonlyMap<string, string>>(new Map());
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    let isCurrent = true;
    folderMappingAction(workspaceId, sourceId)
      .then((loaded) => {
        if (!isCurrent) return;
        setView(loaded);
        setChoices(new Map(loaded.mappings.map((entry) => [entry.path, entry.projectItemId])));
      })
      .catch(() => {
        if (isCurrent) setHasFailed(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [workspaceId, sourceId, folderMappingAction]);
  const chooseFolder = (itemId: string, path: string | null) => {
    setChoices((current) => {
      const next = new Map([...current].filter(([, chosen]) => chosen !== itemId));
      if (path !== null) next.set(path, itemId);
      return next;
    });
    setIsDirty(true);
  };
  const folderOf = (itemId: string) =>
    [...choices].find(([, chosen]) => chosen === itemId)?.[0] ?? null;
  return {
    view,
    hasFailed,
    folderOf,
    isTakenByOther: (path, itemId) => {
      const chosen = choices.get(path);
      return chosen !== undefined && chosen !== itemId;
    },
    chooseFolder,
    isDirty,
    entries: () => [...choices].map(([path, projectItemId]) => ({ path, projectItemId })),
  };
}
