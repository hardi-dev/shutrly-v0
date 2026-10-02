import "server-only";

import type {
  AvailableSourceProvider,
  SourceProvider,
} from "@/features/gallery/domain/source-provider/source-provider.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface WorkspaceSourceRecord {
  readonly id: string;
  readonly provider: SourceProvider;
  readonly displayName: string;
  readonly isActive: boolean;
}

export interface NewWorkspaceSource {
  readonly provider: AvailableSourceProvider;
  readonly displayName: string;
  readonly editorUserId: string | null;
}

export interface WorkspaceSourceRepositoryPort {
  readonly listForWorkspace: (
    context: WorkspaceContext,
  ) => Promise<readonly WorkspaceSourceRecord[]>;
  readonly create: (
    context: WorkspaceContext,
    source: NewWorkspaceSource,
  ) => Promise<"CREATED" | "NAME_TAKEN">;
  readonly rename: (
    context: WorkspaceContext,
    change: { readonly id: string; readonly displayName: string; readonly editorUserId: string },
  ) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly setActive: (
    context: WorkspaceContext,
    change: { readonly id: string; readonly isActive: boolean; readonly editorUserId: string },
  ) => Promise<boolean>;
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  readonly seedDefault: (context: WorkspaceContext, source: NewWorkspaceSource) => Promise<void>;
}
