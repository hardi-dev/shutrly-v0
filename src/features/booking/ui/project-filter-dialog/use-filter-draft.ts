"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EMPTY_PROJECT_FILTER } from "@/features/booking/domain/project-list-query/project-list-filter";
import { filterFormSchema } from "@/features/booking/domain/project-list-query/project-list-filter.schema";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

import { listUrlAt, projectTabPath } from "../project-search-field/project-tab-path";
import { PROJECT_FILTER_DIALOG_COPY_NAMESPACE } from "./project-filter-dialog.copy";

/** Holds the dialog's draft filter and applies it to the URL, keeping the search text (A-11). `basePath` applies it to another page, such as the dashboard (F-26). @param input - workspace, tab, search, the URL filter and an optional path @returns the draft and its actions */
export function useFilterDraft(input: {
  workspaceId: string;
  tab: ProjectTab;
  q: string;
  filter: ProjectFilter;
  basePath?: string;
}) {
  const t = useTranslations(PROJECT_FILTER_DIALOG_COPY_NAMESPACE);
  const router = useRouter();
  const [draft, setDraft] = useState<ProjectFilter>(input.filter);
  const [toError, setToError] = useState<string | undefined>();
  const [seen, setSeen] = useState(input.filter);
  // Re-open with the URL's filter: new server data replaces the draft during render.
  if (seen !== input.filter) {
    setSeen(input.filter);
    setDraft(input.filter);
    setToError(undefined);
  }
  const patch = (next: Partial<ProjectFilter>) => {
    setDraft((current) => ({ ...current, ...next }));
    setToError(undefined);
  };
  const go = (filter: ProjectFilter) => {
    const path = input.basePath ?? projectTabPath(input.workspaceId, input.tab);
    router.replace(listUrlAt(path, input.q, filter));
  };
  const apply = (): boolean => {
    const result = filterFormSchema.safeParse(draft);
    if (!result.success) {
      setToError(t("filterToBeforeFrom"));
      return false;
    }
    go(draft);
    return true;
  };
  const reset = () => {
    setDraft(EMPTY_PROJECT_FILTER);
    go(EMPTY_PROJECT_FILTER);
  };
  return { draft, toError, patch, apply, reset };
}
