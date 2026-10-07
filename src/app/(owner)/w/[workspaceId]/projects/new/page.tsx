import { addClientAction } from "@/app/actions/booking/clients";
import { createProjectAction, searchActiveClientsAction } from "@/app/actions/booking/projects";
import { TEAM_QUICK_ADD_ACTIONS } from "@/app/actions/booking/team-quick-add-actions";
import { loadCreateProjectOptions } from "@/composition/booking/project-flow/project-flow";
import { loadAssignableMembers, loadTeamRoles } from "@/composition/booking/team-flow/team-flow";
import { CreateProjectScreen } from "@/features/booking/ui/create-project-screen/create-project-screen";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TeamQuickAddProvider } from "@/features/booking/ui/team-quick-add/team-quick-add";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function NewProjectPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { serviceGroups, hasActiveService, definitions } =
    await loadCreateProjectOptions(workspaceId);
  const [assignableMembers, roles] = await Promise.all([
    loadAssignableMembers(workspaceId),
    loadTeamRoles(workspaceId),
  ]);
  return (
    <>
      <PageHeadingOverride
        title={PROJECT_COPY.createTitle}
        subtitle={PROJECT_COPY.createSubtitle}
        parent={{ label: PROJECT_COPY.parentLabel, href: `/w/${workspaceId}/projects` }}
        hidesBottomNav
      />
      <TeamQuickAddProvider value={{ workspaceId, roles, ...TEAM_QUICK_ADD_ACTIONS }}>
        <CreateProjectScreen
          workspaceId={workspaceId}
          serviceGroups={serviceGroups}
          hasActiveService={hasActiveService}
          definitions={definitions}
          assignableMembers={assignableMembers}
          createAction={createProjectAction}
          searchClientsAction={searchActiveClientsAction}
          createClientAction={addClientAction}
        />
      </TeamQuickAddProvider>
    </>
  );
}
