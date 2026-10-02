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
type WriteMutation = () => Promise<MutationResult>;

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

async function runWriteMutation(mutation: WriteMutation): Promise<MutationResult> {
  try {
    const result = await mutation();
    if (result?.ok === false) return result;
    showToast({ tone: "success", title: CATALOG_COPY.savedToast });
    return result;
  } catch {
    showToast({
      tone: "danger",
      title: CATALOG_COPY.serverErrorTitle,
      body: CATALOG_COPY.serverErrorBody,
      action: { label: CATALOG_COPY.retry, onAction: () => void runWriteMutation(mutation) },
    });
    return undefined;
  }
}

export function useCatalogMutations(workspaceId: string, actions: CatalogMutationActions) {
  const addCategory = useCallback(
    (values: unknown): Promise<MutationResult> =>
      runWriteMutation(() => actions.addCategory(workspaceId, values)),
    [actions, workspaceId],
  );

  const renameCategory = useCallback(
    async (categoryId: string, values: unknown): Promise<MutationResult> => {
      const rename = actions.renameCategory;
      if (!rename) return undefined;
      return runWriteMutation(() => rename(workspaceId, categoryId, values));
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
