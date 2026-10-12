"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import { PROJECT_SEARCH_DEBOUNCE_MS } from "@/features/booking/domain/project-list-query/project-list-query";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { Input } from "@/ui/primitives/input/input";

import { PROJECT_SEARCH_FIELD_COPY_NAMESPACE } from "./project-search-field.copy";
import { projectListUrl } from "./project-tab-path";

/** Updates the current project-tab URL after a short debounce; clearing it drops `?q=` (AC-PRJ-004). */
export function ProjectSearchField({
  workspaceId,
  tab,
  q,
  filter,
  resultCount,
}: Readonly<{
  workspaceId: string;
  tab: ProjectTab;
  q: string;
  filter: ProjectFilter;
  resultCount: number;
}>) {
  const t = useTranslations(PROJECT_SEARCH_FIELD_COPY_NAMESPACE);
  const { value, change, clear } = useProjectSearch(q, (text) =>
    projectListUrl(workspaceId, tab, text, filter),
  );
  return (
    <>
      <div className="w-full md:w-[320px]">
        <Input
          variant="search"
          aria-label={t("searchLabel")}
          placeholder={t("searchLabel")}
          value={value}
          onChange={change}
          iconLeading="search"
          iconTrailing={value ? "x" : undefined}
          iconTrailingAction={value ? { label: t("clearSearch"), onPress: clear } : undefined}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {value ? t("searchResultCount", { count: resultCount }) : ""}
      </p>
    </>
  );
}

function useProjectSearch(q: string, urlFor: (text: string) => string) {
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
      router.replace(urlFor(next));
    }, PROJECT_SEARCH_DEBOUNCE_MS);
  };
  const clear = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setValue("");
    router.replace(urlFor(""));
  };
  return { value, change, clear };
}
