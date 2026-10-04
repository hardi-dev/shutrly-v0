import type { ReactNode } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";

import type { AssignmentDialogProps } from "../assignment-dialog/assignment-dialog.types";
import type { DefinitionOption, ProjectEditActions } from "../project-edit/project-edit.types";
import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";
import type { SessionTeamDialogProps } from "../session-team-dialog/session-team-dialog.types";

export interface ProjectDetailScreenProps {
  readonly workspaceId: string;
  readonly project: ProjectDetailView;
  readonly menuActions: ProjectMenuActions;
  readonly editActions: ProjectEditActions;
  readonly definitions: readonly DefinitionOption[];
  /** Active members with their roles, for the Penugasan form (D-13). */
  readonly assignableMembers: readonly AssignableMember[];
  readonly addAssignmentAction: AssignmentDialogProps["addAction"];
  readonly removeAssignmentAction: SessionTeamDialogProps["removeAction"];
}

export interface ProjectDetailCardProps {
  readonly project: ProjectDetailView;
  readonly isMobile: boolean;
}

/** What the *Jadwal* rows can do with a session's team; the host decides where each opens. */
export interface SessionTeamHandlers {
  readonly onAdd: (session: ProjectDetailView["sessions"][number]) => void;
  readonly onManage: (session: ProjectDetailView["sessions"][number]) => void;
}

export interface DetailEditHandlers {
  readonly onAddItem: () => void;
  readonly onEditItem: (item: ProjectDetailView["items"][number]) => void;
  readonly onRemoveItem: (item: ProjectDetailView["items"][number]) => void;
  readonly onEditFields: () => void;
  readonly onAddSession: () => void;
  readonly onEditSession: (session: ProjectDetailView["sessions"][number]) => void;
  readonly onDeleteSession: (session: ProjectDetailView["sessions"][number]) => void;
}

export type EditItem = ProjectDetailView["items"][number];
export type EditSession = ProjectDetailView["sessions"][number];
export type EditOpen =
  | { readonly kind: "addItem" }
  | { readonly kind: "editItem"; readonly item: EditItem }
  | { readonly kind: "removeItem"; readonly item: EditItem }
  | { readonly kind: "fields" }
  | { readonly kind: "addSession" }
  | { readonly kind: "editSession"; readonly session: EditSession }
  | { readonly kind: "deleteSession"; readonly session: EditSession }
  | null;

export interface SessionTrailingProps {
  readonly session: ProjectDetailView["sessions"][number];
  readonly assignments: ProjectDetailView["assignments"];
  readonly canEditTeam: boolean;
  readonly team?: SessionTeamHandlers;
  readonly menu: ReactNode;
}

export interface SessionRowProps {
  readonly session: ProjectDetailView["sessions"][number];
  readonly isLastRow: boolean;
  readonly assignments: ProjectDetailView["assignments"];
  readonly canEditTeam: boolean;
  readonly team?: SessionTeamHandlers;
  /** Present while the schedule is editable; it carries the ⋯ menu. */
  readonly edit?: DetailEditHandlers;
  readonly isLastOfBooked: boolean;
}
