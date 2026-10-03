import type { ReactNode } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";

import type { AssignmentDialogProps } from "../assignment-dialog/assignment-dialog.types";
import type { SessionTeamHandlers } from "../project-detail-screen/project-detail-screen.types";
import type { SessionTeamDialogProps } from "../session-team-dialog/session-team-dialog.types";

/** D-15: which team dialog is open, for which session, and where saving goes next. */
export interface SessionTeamState {
  readonly view: "closed" | "assign" | "team";
  readonly sessionId: string | null;
  readonly returnTo: "closed" | "team";
}

export interface SessionTeamHostProps {
  readonly workspaceId: string;
  readonly project: ProjectDetailView;
  readonly assignableMembers: readonly AssignableMember[];
  readonly addAssignmentAction: AssignmentDialogProps["addAction"];
  readonly removeAssignmentAction: SessionTeamDialogProps["removeAction"];
  readonly children: (team: SessionTeamHandlers) => ReactNode;
}

export interface OpenTeamDialogProps extends Omit<SessionTeamHostProps, "children"> {
  readonly state: SessionTeamState;
  readonly dispatch: (action: SessionTeamAction) => void;
}

export type SessionTeamAction =
  | { readonly type: "assign"; readonly sessionId: string }
  | { readonly type: "team"; readonly sessionId: string }
  | { readonly type: "addFromTeam" }
  | { readonly type: "saved" }
  | { readonly type: "dismiss" };
