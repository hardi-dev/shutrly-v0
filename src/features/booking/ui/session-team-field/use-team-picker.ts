"use client";

import { useState } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

import type { TeamPickerState } from "./session-team-field.types";

const IDLE: TeamPickerState = { memberId: null, roleId: null };

/**
 * Drives the add row of the team field: the member being picked and their role (the member's first
 * role is preselected, as in the Penugasan form). Members already picked are not offered again.
 * @param members - the active members
 * @param picks - what is already picked for the session
 * @param onChange - called with the new list after an add or a removal
 * @returns the state, the candidates and the handlers
 */
export function useTeamPicker(
  members: readonly AssignableMember[],
  picks: readonly TeamPick[],
  onChange: (picks: readonly TeamPick[]) => void,
) {
  const [state, setState] = useState<TeamPickerState>(IDLE);
  const candidates = members.filter((m) => !picks.some((pick) => pick.memberId === m.id));
  const member = candidates.find((candidate) => candidate.id === state.memberId);
  function selectMember(memberId: string): void {
    const next = candidates.find((candidate) => candidate.id === memberId);
    setState({ memberId, roleId: next?.roles.at(0)?.id ?? null });
  }
  function selectRole(roleId: string): void {
    setState((previous) => ({ ...previous, roleId }));
  }
  function add(): void {
    if (state.memberId === null || state.roleId === null) return;
    onChange([...picks, { memberId: state.memberId, roleId: state.roleId }]);
    setState(IDLE);
  }
  function remove(memberId: string): void {
    onChange(picks.filter((pick) => pick.memberId !== memberId));
  }
  // A complete choice that was not added yet still counts when the session is saved.
  const pending: TeamPick | null =
    member && state.roleId !== null ? { memberId: member.id, roleId: state.roleId } : null;
  return { state, picks, candidates, member, pending, selectMember, selectRole, add, remove };
}
