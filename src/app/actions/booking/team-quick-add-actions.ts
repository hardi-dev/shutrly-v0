import type { TeamQuickAddValue } from "@/features/booking/ui/team-quick-add/team-quick-add.types";

import { addTeamMemberAction, addTeamRoleAction, updateTeamMemberAction } from "./team";

/** The team actions a session dialog uses to add a member without leaving the page (Revision OT #1, #2). */
export const TEAM_QUICK_ADD_ACTIONS: Pick<
  TeamQuickAddValue,
  "addAction" | "updateAction" | "addRoleAction"
> = {
  addAction: addTeamMemberAction,
  updateAction: updateTeamMemberAction,
  addRoleAction: addTeamRoleAction,
};
