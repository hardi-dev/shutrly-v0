import {
  addTeamMemberAction,
  addTeamRoleAction,
  loadMoreTeamMembersAction,
  updateTeamMemberAction,
} from "@/app/actions/booking/team";
import { loadTeamMembers } from "@/composition/booking/team-flow/team-flow";
import { TeamMembersScreen } from "@/features/booking/ui/team-members-screen/team-members-screen";

export default async function TeamPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ workspaceId: string }>; searchParams: Promise<{ q?: string }> }>) {
  const { workspaceId } = await params;
  const { q } = await searchParams;
  const data = await loadTeamMembers(workspaceId, "ACTIVE", q);
  return (
    <TeamMembersScreen
      workspaceId={workspaceId}
      status={data.status}
      count={data.count}
      q={data.q}
      initialPage={data.page}
      loadMoreAction={loadMoreTeamMembersAction}
      roles={data.roles}
      addAction={addTeamMemberAction}
      updateAction={updateTeamMemberAction}
      addRoleAction={addTeamRoleAction}
    />
  );
}
