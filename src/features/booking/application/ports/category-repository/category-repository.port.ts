import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface CategoryRecord {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly serviceCount: number;
  readonly archivedServiceCount: number;
}

export interface CategoryChange {
  readonly id: string;
  readonly name: string;
  readonly editorUserId: string;
}

export interface ActiveChange {
  readonly id: string;
  readonly isActive: boolean;
  readonly editorUserId: string;
}

export interface CategoryRepositoryPort {
  readonly list: (context: WorkspaceContext) => Promise<readonly CategoryRecord[]>;
  readonly create: (
    context: WorkspaceContext,
    name: string,
    editorUserId: string,
  ) => Promise<
    { readonly status: "CREATED"; readonly id: string } | { readonly status: "NAME_TAKEN" }
  >;
  readonly rename: (
    context: WorkspaceContext,
    change: CategoryChange,
  ) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
}
