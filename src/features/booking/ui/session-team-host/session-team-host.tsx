"use client";

import { useReducer } from "react";

import { assignableFor } from "@/features/booking/domain/session-assignment/session-assignment";

import { AssignmentDialog } from "../assignment-dialog/assignment-dialog";
import type { SessionTeamHandlers } from "../project-detail-screen/project-detail-screen.types";
import {
  afterSave,
  dismiss,
  openAssign,
  openTeam,
  SESSION_TEAM_CLOSED,
  syncTeam,
} from "./session-team-flow";
import type {
  SessionTeamAction,
  SessionTeamHostProps,
  SessionTeamState,
} from "./session-team-host.types";

function reduce(state: SessionTeamState, action: SessionTeamAction): SessionTeamState {
  if (action.type === "assign") return openAssign(action.sessionId);
  if (action.type === "team") return openTeam(action.sessionId);
  if (action.type === "saved") return afterSave(state);
  return dismiss(state);
}

/**
 * Owns the session team dialogs: it hands the *Jadwal* rows their handlers and shows the
 * Penugasan form for the session in question (D-15). *Atur tim* opens the same form until it is built.
 * @param props - the project, the assignable members, the save action and the render function
 * @returns the rows' content with the open dialog
 */
export function SessionTeamHost({
  workspaceId,
  project,
  assignableMembers,
  addAssignmentAction,
  children,
}: Readonly<SessionTeamHostProps>) {
  const [state, dispatch] = useReducer(reduce, SESSION_TEAM_CLOSED);
  const session = project.sessions.find((candidate) => candidate.id === state.sessionId);
  const shown = syncTeam(
    state,
    project.assignments.filter((a) => a.sessionId === state.sessionId).length,
  );
  function handleAdd(target: { readonly id: string }): void {
    dispatch({ type: "assign", sessionId: target.id });
  }
  function handleManage(target: { readonly id: string }): void {
    // The read-only team view of a cancelled project arrives with Atur tim.
    if (project.canEditTeam) dispatch({ type: "team", sessionId: target.id });
  }
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) dispatch({ type: "dismiss" });
  }
  function handleSaved(): void {
    dispatch({ type: "saved" });
  }
  const team: SessionTeamHandlers = { onAdd: handleAdd, onManage: handleManage };
  return (
    <>
      {children(team)}
      {session ? (
        <AssignmentDialog
          key={`${session.id}-${shown.view}`}
          isOpen={shown.view !== "closed"}
          workspaceId={workspaceId}
          projectId={project.id}
          session={session}
          members={assignableFor(assignableMembers, session.id, project.assignments)}
          onOpenChange={handleOpenChange}
          onSaved={handleSaved}
          addAction={addAssignmentAction}
        />
      ) : null}
    </>
  );
}
