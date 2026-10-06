import "server-only";

import type { AddOnStatus } from "@/features/booking/domain/add-on/add-on.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** A project add-on; money as whole-rupiah digit strings (ADR-007). */
export interface AddOnRecord {
  readonly id: string;
  readonly selectionGroupId: string | null;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly totalAmount: string;
  readonly status: AddOnStatus;
  readonly createdAt: Date;
}

export interface NewAddOn {
  readonly projectId: string;
  readonly selectionGroupId: string | null;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly totalAmount: string;
  readonly createdBy: string;
}

/** An approval or cancellation with who and when (BR-AUD-001). */
export interface AddOnStatusWrite {
  readonly status: "APPROVED" | "CANCELLED";
  readonly actorId: string;
  readonly at: Date;
}

export interface AddOnRepositoryPort {
  /** The project's stored status, or null when it isn't in the workspace. */
  readonly findProjectStatus: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<ProjectStatus | null>;
  readonly insert: (context: WorkspaceContext, addOn: NewAddOn) => Promise<string>;
  /** The project's add-ons, oldest first. */
  readonly list: (context: WorkspaceContext, projectId: string) => Promise<readonly AddOnRecord[]>;
  /** The add-on of this project, locked FOR UPDATE (lock order: add-on, then group). */
  readonly findForUpdate: (
    context: WorkspaceContext,
    projectId: string,
    addOnId: string,
  ) => Promise<AddOnRecord | null>;
  readonly setStatus: (
    context: WorkspaceContext,
    addOnId: string,
    change: AddOnStatusWrite,
  ) => Promise<void>;
  /** Removes a draft; never an approved or cancelled add-on (A-35). */
  readonly deleteDraft: (context: WorkspaceContext, addOnId: string) => Promise<void>;
}
