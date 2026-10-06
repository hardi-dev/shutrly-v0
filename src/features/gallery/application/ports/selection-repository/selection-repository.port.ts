import "server-only";

import type {
  PickMode,
  SelectionGroupStatus,
} from "@/features/gallery/domain/selection-usage/selection-usage.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** A selection group with its snapshotted item and usage (D-9, D-11). */
export interface SelectionGroupRecord {
  readonly id: string;
  readonly projectItemId: string;
  /** project_item.name */
  readonly name: string;
  /** project_item.unit */
  readonly unit: string | null;
  readonly mode: PickMode;
  readonly allowsPickNotes: boolean;
  readonly baseLimit: number;
  readonly extraLimit: number;
  readonly status: SelectionGroupStatus;
  readonly usage: number;
  readonly pickCount: number;
  readonly noteCount: number;
  readonly submittedAt: Date | null;
  readonly lockedAt: Date | null;
  readonly sortOrder: number;
}

/** What a deal edit did to a project item, so the group can follow (D-10c). */
export type ItemChange =
  | { readonly kind: "ADDED"; readonly projectId: string; readonly definitionId: string }
  | { readonly kind: "VALUE"; readonly projectId: string; readonly itemId: string }
  | { readonly kind: "REMOVING"; readonly projectId: string; readonly itemId: string };

export interface SelectionRepositoryPort {
  /** The project's groups in project-item order, with usage. */
  readonly listGroups: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<readonly SelectionGroupRecord[]>;
  /** Locks the project row first, keeping the lock order project → group (D-17). */
  readonly lockProject: (context: WorkspaceContext, projectId: string) => Promise<boolean>;
  /** The group of a project item, locked FOR UPDATE, or null. */
  readonly findGroupByItemForUpdate: (
    context: WorkspaceContext,
    itemId: string,
  ) => Promise<SelectionGroupRecord | null>;
  /** The whole-number limit an item's snapshotted value gives. */
  readonly itemLimit: (context: WorkspaceContext, itemId: string) => Promise<number>;
  /** Creates the OPEN group of a newly added selection item when the project's gallery is published. */
  readonly createGroupForItem: (
    context: WorkspaceContext,
    projectId: string,
    definitionId: string,
  ) => Promise<void>;
  readonly setBaseLimit: (
    context: WorkspaceContext,
    groupId: string,
    base: number,
  ) => Promise<void>;
  readonly deleteGroup: (context: WorkspaceContext, groupId: string) => Promise<void>;
}
