import type { ReactNode } from "react";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { RemoveAssignmentWriteResult } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";

export type SessionAssignment = ProjectDetailView["assignments"][number];

export interface SessionTeamDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly session: SessionRecordShape;
  /** The session's assignments, in their stored order. */
  readonly assignments: readonly SessionAssignment[];
  /** False for a cancelled project: the team is shown without its actions (AC-TEAM-015). */
  readonly canEdit: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** *Tambah anggota*: the host opens the Penugasan form and returns here when it is saved. */
  readonly onAddMember: () => void;
  readonly removeAction: (
    workspaceId: string,
    projectId: string,
    assignmentId: string,
  ) => Promise<RemoveAssignmentWriteResult>;
}

export interface SessionTeamShellProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly actions: ReactNode;
  readonly children: ReactNode;
}

export interface SessionTeamRowsProps {
  readonly sessionName: string;
  readonly assignments: readonly SessionAssignment[];
  readonly canEdit: boolean;
  readonly onRemove: (assignment: SessionAssignment) => void;
}
