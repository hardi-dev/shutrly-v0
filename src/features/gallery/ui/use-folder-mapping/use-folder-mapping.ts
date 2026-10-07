"use client";

import { useEffect, useState } from "react";

import type { FolderMappingView } from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping.types";

import type { FolderMappingState, UseFolderMappingInput } from "./use-folder-mapping.types";

/**
 * The folder *Edit*'s subfolder mapping (F-20): loads the subfolders, the package's selection items
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
  const choose = (path: string, projectItemId: string | null) => {
    setChoices((current) => {
      const next = new Map(current);
      if (projectItemId === null) next.delete(path);
      else next.set(path, projectItemId);
      return next;
    });
    setIsDirty(true);
  };
  return {
    view,
    hasFailed,
    itemOf: (path) => choices.get(path) ?? null,
    choose,
    isDirty,
    entries: () => [...choices].map(([path, projectItemId]) => ({ path, projectItemId })),
  };
}
