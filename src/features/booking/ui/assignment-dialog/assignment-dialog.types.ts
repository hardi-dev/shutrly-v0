import type { ReactNode } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { AssignmentWriteResult } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";

export interface AssignmentDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly session: SessionRecordShape;
  /** Active members not yet on the session (UX only; the server re-checks, D-4). */
  readonly members: readonly AssignableMember[];
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Called after the assignment is saved. */
  readonly onSaved: () => void;
  readonly addAction: (
    workspaceId: string,
    projectId: string,
    sessionId: string,
    values: unknown,
  ) => Promise<AssignmentWriteResult>;
}

export interface AssignmentDialogBodyProps extends AssignmentDialogProps {
  /** The member just added from the empty state, preselected (Revision OT #2). */
  readonly initialMemberId: string | null;
  readonly onMemberAdded: (member: AssignableMember) => void;
}

export interface NoMembersProps {
  readonly canQuickAdd: boolean;
  readonly onAdded: (member: AssignableMember) => void;
  readonly onOpenTeam: () => void;
}

export interface AssignmentShellProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly isPending: boolean;
  readonly onClose: () => void;
  readonly submit: ReactNode;
  readonly children: ReactNode;
}

export interface AssignmentFormState {
  readonly memberId: string | null;
  readonly roleId: string | null;
  readonly isPending: boolean;
  readonly error: { readonly field: "member" | "role"; readonly text: string } | null;
}
