import type { SessionAssignmentRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

/**
 * Shows the picks of a session that is not saved yet the way a saved team is shown, so the same
 * avatar group can render it (AC-TEAM-028). A pick whose member is gone is left out.
 * @param sessionId - the session's position in the form
 * @param picks - the members picked for it
 * @param members - the active members the picks refer to
 * @returns the picks as assignment records, in pick order
 */
export function picksAsAssignments(
  sessionId: string,
  picks: readonly TeamPick[],
  members: readonly AssignableMember[],
): SessionAssignmentRecord[] {
  return picks.flatMap((pick) => {
    const member = members.find((candidate) => candidate.id === pick.memberId);
    const role = member?.roles.find((candidate) => candidate.id === pick.roleId);
    if (!member || !role) return [];
    return [
      {
        id: `${sessionId}:${member.id}`,
        sessionId,
        memberId: member.id,
        memberName: member.name,
        isMemberArchived: false,
        roleName: role.name,
      },
    ];
  });
}
