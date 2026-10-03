import type { ProjectStatus } from "../project-status/project-status.types";
import type { AssignmentRef, AvatarGroup } from "./session-assignment.types";

/** design.md decision 3: at most three avatars, then +n. */
export const SESSION_AVATAR_MAX = 3;

/**
 * BR-TEAM-006: assignments are added and removed in every status except CANCELLED.
 * @param status - the project's status
 * @returns whether the team can still be changed
 */
export function isTeamEditable(status: ProjectStatus): boolean {
  return status !== "CANCELLED";
}

/**
 * Splits a session's assignments into the avatars shown and the overflow count (AC-TEAM-026).
 * @param assignments - the session's assignments in their stored order
 * @returns up to `SESSION_AVATAR_MAX` assignments and how many were left out
 */
export function avatarGroup<T>(assignments: readonly T[]): AvatarGroup<T> {
  return {
    shown: assignments.slice(0, SESSION_AVATAR_MAX),
    overflow: Math.max(0, assignments.length - SESSION_AVATAR_MAX),
  };
}

/**
 * A-12 (UX only; the server re-checks): the members not on the session yet.
 * @param members - the active members
 * @param sessionId - the session being staffed
 * @param assignments - every assignment of the project
 * @returns the members who can still be added
 */
export function assignableFor<M extends { readonly id: string }>(
  members: readonly M[],
  sessionId: string,
  assignments: readonly AssignmentRef[],
): M[] {
  const taken = new Set(
    assignments.filter((a) => a.sessionId === sessionId).map((a) => a.memberId),
  );
  return members.filter((member) => !taken.has(member.id));
}
