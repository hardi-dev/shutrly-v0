import "server-only";

import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type {
  PickMode,
  SelectionGroupStatus,
} from "@/features/gallery/domain/selection-usage/selection-usage.types";
import type { SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";
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

/** A photo's facts for the pick checks (D-12, AC-SEL-006). */
export interface PickablePhoto {
  readonly kind: PhotoKind;
  readonly missing: boolean;
  readonly sourceRemoved: boolean;
}

export interface StoredPick {
  readonly quantity: number;
  readonly note: string | null;
}

/** Pick writes under the group lock (BR-SEL-006, D-12). */
export interface PickWriter {
  /** The photo when it belongs to the group's gallery, else null. */
  readonly findPhoto: (photoId: string) => Promise<PickablePhoto | null>;
  readonly findPick: (photoId: string) => Promise<StoredPick | null>;
  readonly insertPick: (photoId: string, quantity: number) => Promise<void>;
  readonly updateQuantity: (photoId: string, quantity: number) => Promise<void>;
  /** Deletes the pick and its note (A-32). */
  readonly deletePick: (photoId: string) => Promise<void>;
  readonly setNote: (photoId: string, note: string | null) => Promise<void>;
  /** Moves the locked group to `SUBMITTED` (BR-SEL-005). */
  readonly markSubmitted: (at: Date) => Promise<void>;
  /** Moves the locked group to `LOCKED` with who and when (BR-SEL-005, BR-AUD-001). */
  readonly markLocked: (actorId: string, at: Date) => Promise<void>;
}

/** A pick with the photo facts the client views need (Pilih, Tinjau, markers). */
export interface PickedPhotoRecord {
  readonly groupId: string;
  readonly photoId: string;
  readonly quantity: number;
  readonly note: string | null;
  readonly fileName: string;
  readonly folderPath: string;
  readonly externalFileId: string;
  readonly provider: SourceProvider;
  readonly missing: boolean;
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
  /** Locks a group of this project FOR UPDATE in a transaction and runs the work (BR-SEL-006). */
  readonly withLockedGroup: <T>(
    context: WorkspaceContext,
    projectId: string,
    groupId: string,
    work: (group: SelectionGroupRecord, writer: PickWriter) => Promise<T>,
  ) => Promise<T | "NOT_FOUND">;
  /** Every pick of the project's groups, missing photos included (A-8). */
  readonly listPickedPhotos: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<readonly PickedPhotoRecord[]>;
}
