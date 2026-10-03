"use client";

import { useEffect, useState } from "react";

import type { FilterClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";

import type { SearchFilterClientsCall } from "./project-filter-dialog.types";

const DEBOUNCE_MS = 250;

/** Searches active and archived clients for the Klien field after a short pause. @param workspaceId - the workspace @param text - what was typed @param action - the server search @returns the matches */
export function useFilterClientSearch(
  workspaceId: string,
  text: string,
  action: SearchFilterClientsCall,
): readonly FilterClientOption[] {
  const [items, setItems] = useState<readonly FilterClientOption[]>([]);
  useEffect(() => {
    let isCurrent = true;
    const timer = window.setTimeout(() => {
      void action(workspaceId, text).then((found) => {
        if (isCurrent) setItems(found);
      });
    }, DEBOUNCE_MS);
    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [workspaceId, text, action]);
  return items;
}
