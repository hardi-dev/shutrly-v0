"use client";

import { useReducer } from "react";

import { assignableFor } from "@/features/booking/domain/session-assignment/session-assignment";

import { AssignmentDialog } from "../assignment-dialog/assignment-dialog";
import type { SessionTeamHandlers } from "../project-detail-screen/project-detail-screen.types";
import { SessionTeamDialog } from "../session-team-dialog/session-team-dialog";
import {
  addFromTeam,
  afterSave,
  dismiss,
  openAssign,
  openTeam,
  SESSION_TEAM_CLOSED,
  syncTeam,
} from "./session-team-flow";
import type {
  OpenTeamDialogProps,
  SessionTeamAction,
  SessionTeamHostProps,
  SessionTeamState,
} from "./session-team-host.types";

function reduce(state: SessionTeamState, action: SessionTeamAction): SessionTeamState {
  if (action.type === "assign") return openAssign(action.sessionId);
  if (action.type === "team") return openTeam(action.sessionId);
  if (action.type === "addFromTeam") return addFromTeam(state);
  if (action.type === "saved") return afterSave(state);
  return dismiss(state);
}

/**
 * Owns the session team dialogs: it hands the *Jadwal* rows their handlers and shows
 * *Atur tim* or the Penugasan form for the session in question (D-15).
 * @param props - the project, the assignable members, the save and remove actions and the render function
 * @returns the rows' content with the open dialog
 */
export function SessionTeamHost({ children, ...props }: Readonly<SessionTeamHostProps>) {
  const [state, dispatch] = useReducer(reduce, SESSION_TEAM_CLOSED);
  function handleAdd(target: { readonly id: string }): void {
    dispatch({ type: "assign", sessionId: target.id });
  }
  function handleManage(target: { readonly id: string }): void {
    dispatch({ type: "team", sessionId: target.id });
  }
  const team: SessionTeamHandlers = { onAdd: handleAdd, onManage: handleManage };
  return (
    <>
      {children(team)}
      <OpenTeamDialog {...props} state={state} dispatch={dispatch} />
    </>
  );
}

function OpenTeamDialog(props: Readonly<OpenTeamDialogProps>) {
  const { workspaceId, project, state, dispatch } = props;
  const session = project.sessions.find((candidate) => candidate.id === state.sessionId);
  const assignments = project.assignments.filter((a) => a.sessionId === state.sessionId);
  const view = syncTeam(state, assignments.length).view;
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) dispatch({ type: "dismiss" });
  }
  function handleAddMember(): void {
    dispatch({ type: "addFromTeam" });
  }
  function handleSaved(): void {
    dispatch({ type: "saved" });
  }
  if (!session || view === "closed") return null;
  if (view === "team") {
    return (
      <SessionTeamDialog
        isOpen
        workspaceId={workspaceId}
        projectId={project.id}
        session={session}
        assignments={assignments}
        canEdit={project.canEditTeam}
        onOpenChange={handleOpenChange}
        onAddMember={handleAddMember}
        removeAction={props.removeAssignmentAction}
      />
    );
  }
  return (
    <AssignmentDialog
      key={`${session.id}-${state.returnTo}`}
      isOpen
      workspaceId={workspaceId}
      projectId={project.id}
      session={session}
      members={assignableFor(props.assignableMembers, session.id, project.assignments)}
      onOpenChange={handleOpenChange}
      onSaved={handleSaved}
      addAction={props.addAssignmentAction}
    />
  );
}
