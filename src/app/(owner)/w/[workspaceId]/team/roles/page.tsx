import {
  addTeamRoleAction,
  deleteTeamRoleAction,
  renameTeamRoleAction,
} from "@/app/actions/booking/team";
import { loadTeamRoles } from "@/composition/booking/team-flow/team-flow";
import { TeamRolesScreen } from "@/features/booking/ui/team-roles-screen/team-roles-screen";

export default async function TeamRolesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const roles = await loadTeamRoles(workspaceId);
  return (
    <TeamRolesScreen
      workspaceId={workspaceId}
      roles={roles}
      addAction={addTeamRoleAction}
      renameAction={renameTeamRoleAction}
      deleteAction={deleteTeamRoleAction}
    />
  );
}
