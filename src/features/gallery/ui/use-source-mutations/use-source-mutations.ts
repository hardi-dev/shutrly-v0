"use client";

import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type { AddSourceInput } from "../../application/schemas/add-source/add-source.types";
import type { SourceNameInput } from "../../application/schemas/source-name/source-name.types";
import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";
import type { DeleteSourceResult } from "../../application/use-cases/delete-workspace-source/delete-workspace-source.types";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";

export interface SourceMutationActions {
  readonly add: (
    workspaceId: string,
    values: AddSourceInput,
  ) => Promise<SourceValidationFailure | undefined>;
  readonly rename: (
    workspaceId: string,
    sourceId: string,
    values: SourceNameInput,
  ) => Promise<SourceValidationFailure | undefined>;
  readonly setActive: (workspaceId: string, sourceId: string, isActive: boolean) => Promise<void>;
  readonly remove: (workspaceId: string, sourceId: string) => Promise<DeleteSourceResult>;
}

// eslint-disable-next-line max-lines-per-function -- groups the four source operations under one workspace scope
export function useSourceMutations(workspaceId: string, actions: SourceMutationActions) {
  const add = useCallback(
    async (values: AddSourceInput) => {
      try {
        const result = await actions.add(workspaceId, values);
        if (result?.ok === false) return result;
        showToast({
          tone: "success",
          title: SOURCE_COPY.addedTitle,
          body: SOURCE_COPY.addedBody(values.displayName),
        });
        return result;
      } catch {
        showToast({
          tone: "danger",
          title: SOURCE_COPY.serverErrorTitle,
          body: SOURCE_COPY.serverErrorBody,
        });
        return undefined;
      }
    },
    [actions, workspaceId],
  );

  const rename = useCallback(
    async (sourceId: string, values: SourceNameInput) => {
      try {
        const result = await actions.rename(workspaceId, sourceId, values);
        if (result?.ok === false) return result;
        showToast({
          tone: "success",
          title: SOURCE_COPY.renamedTitle,
          body: SOURCE_COPY.renamedBody(values.displayName),
        });
        return result;
      } catch {
        showToast({
          tone: "danger",
          title: SOURCE_COPY.serverErrorTitle,
          body: SOURCE_COPY.serverErrorBody,
        });
        return undefined;
      }
    },
    [actions, workspaceId],
  );

  const setActive = useCallback(
    async (sourceId: string, isActive: boolean) =>
      actions.setActive(workspaceId, sourceId, isActive),
    [actions, workspaceId],
  );

  const remove = useCallback(
    async (sourceId: string) => actions.remove(workspaceId, sourceId),
    [actions, workspaceId],
  );

  return { add, rename, setActive, remove };
}
