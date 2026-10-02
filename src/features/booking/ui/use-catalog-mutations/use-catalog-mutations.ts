"use client";

import { useCallback } from "react";

import type {
  CatalogDeleteResult,
  CatalogWriteResult,
} from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";

type MutationResult = CatalogWriteResult | undefined;
type CatalogMutationKind = "category" | "definition" | "service";

export interface CatalogMutationActions {
  readonly addCategory: (workspaceId: string, values: unknown) => Promise<MutationResult>;
  readonly renameCategory?: (
    workspaceId: string,
    categoryId: string,
    values: unknown,
  ) => Promise<MutationResult>;
  readonly setActive?: (
    workspaceId: string,
    kind: CatalogMutationKind,
    id: string,
    isActive: boolean,
  ) => Promise<void>;
  readonly remove?: (
    workspaceId: string,
    kind: CatalogMutationKind,
    id: string,
  ) => Promise<CatalogDeleteResult>;
}

// eslint-disable-next-line max-lines-per-function -- groups the catalog operations under one workspace scope
export function useCatalogMutations(workspaceId: string, actions: CatalogMutationActions) {
  const addCategory = useCallback(
    async (values: unknown): Promise<MutationResult> => {
      try {
        const result: MutationResult = await actions.addCategory(workspaceId, values);
        if (result?.ok === false) return result;
        showToast({ tone: "success", title: CATALOG_COPY.savedToast });
        return result;
      } catch {
        showToast({
          tone: "danger",
          title: CATALOG_COPY.serverErrorTitle,
          body: CATALOG_COPY.serverErrorBody,
        });
        return undefined;
      }
    },
    [actions, workspaceId],
  );

  const renameCategory = useCallback(
    async (categoryId: string, values: unknown): Promise<MutationResult> => {
      if (!actions.renameCategory) return undefined;
      try {
        const result: MutationResult = await actions.renameCategory(
          workspaceId,
          categoryId,
          values,
        );
        if (result?.ok === false) return result;
        showToast({ tone: "success", title: CATALOG_COPY.savedToast });
        return result;
      } catch {
        showToast({
          tone: "danger",
          title: CATALOG_COPY.serverErrorTitle,
          body: CATALOG_COPY.serverErrorBody,
        });
        return undefined;
      }
    },
    [actions, workspaceId],
  );

  const setActive = useCallback(
    async (kind: CatalogMutationKind, id: string, isActive: boolean) => {
      await actions.setActive?.(workspaceId, kind, id, isActive);
    },
    [actions, workspaceId],
  );

  const remove = useCallback(
    async (kind: CatalogMutationKind, id: string) => {
      if (!actions.remove) return { ok: true } as const;
      return actions.remove(workspaceId, kind, id);
    },
    [actions, workspaceId],
  );

  return { addCategory, renameCategory, setActive, remove };
}
