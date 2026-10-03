"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PROJECT_SEARCH_DEBOUNCE_MS } from "@/features/booking/domain/project-list-query/project-list-query";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { Input } from "@/ui/primitives/input/input";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectTabPath } from "./project-tab-path";

/** Updates the current project-tab URL after a short debounce; clearing it drops `?q=` (AC-PRJ-004). */
export function ProjectSearchField({
  workspaceId,
  tab,
  q,
  resultCount,
}: Readonly<{ workspaceId: string; tab: ProjectTab; q: string; resultCount: number }>) {
  const { value, change, clear } = useProjectSearch(q, projectTabPath(workspaceId, tab));
  return (
    <>
      <div className="w-full md:w-[320px]">
        <Input
          variant="search"
          aria-label={PROJECT_COPY.searchLabel}
          placeholder={PROJECT_COPY.searchLabel}
          value={value}
          onChange={change}
          iconLeading="search"
          iconTrailing={value ? "x" : undefined}
          iconTrailingAction={
            value ? { label: PROJECT_COPY.clearSearch, onPress: clear } : undefined
          }
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {value ? PROJECT_COPY.searchResultCount(resultCount) : ""}
      </p>
    </>
  );
}

function useProjectSearch(q: string, pathname: string) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  const timer = useRef<number | undefined>(undefined);
  // Follow a query changed elsewhere (the other breakpoint's field, back/forward) unless typing.
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (timer.current === undefined) setValue(q);
  }
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );
  const change = (next: string) => {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      router.replace(next ? `${pathname}?q=${encodeURIComponent(next)}` : pathname);
    }, PROJECT_SEARCH_DEBOUNCE_MS);
  };
  const clear = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setValue("");
    router.replace(pathname);
  };
  return { value, change, clear };
}
