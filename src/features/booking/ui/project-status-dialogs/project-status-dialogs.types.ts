import type { DeleteDraftResult } from "@/features/booking/application/use-cases/delete-draft/delete-draft.types";
import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

export interface StatusDialogTarget {
  readonly id: string;
  readonly title: string;
  readonly status: ProjectStatus;
  /** D-14: the project has someone assigned, so the delete confirmation says they go too. */
  readonly hasTeam?: boolean;
}

export type CancelProjectCall = (
  workspaceId: string,
  projectId: string,
  values: unknown,
) => Promise<ProjectWriteResult>;

export type DeleteDraftCall = (
  workspaceId: string,
  projectId: string,
) => Promise<DeleteDraftResult>;

export interface CancelProjectDialogProps {
  readonly workspaceId: string;
  readonly target: StatusDialogTarget | null;
  readonly cancelAction: CancelProjectCall;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onDone: () => void;
}

export interface DeleteDraftDialogProps {
  readonly workspaceId: string;
  readonly target: StatusDialogTarget | null;
  readonly deleteAction: DeleteDraftCall;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onDone: () => void;
}
