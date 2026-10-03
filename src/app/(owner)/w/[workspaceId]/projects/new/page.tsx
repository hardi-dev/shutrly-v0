import { addClientAction } from "@/app/actions/booking/clients";
import { createProjectAction, searchActiveClientsAction } from "@/app/actions/booking/projects";
import { loadCreateProjectOptions } from "@/composition/booking/project-flow/project-flow";
import { CreateProjectScreen } from "@/features/booking/ui/create-project-screen/create-project-screen";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function NewProjectPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { serviceGroups } = await loadCreateProjectOptions(workspaceId);
  return (
    <>
      <PageHeadingOverride
        title={PROJECT_COPY.createTitle}
        subtitle={PROJECT_COPY.createSubtitle}
        parent={{ label: PROJECT_COPY.parentLabel, href: `/w/${workspaceId}/projects` }}
        hidesBottomNav
      />
      <CreateProjectScreen
        workspaceId={workspaceId}
        serviceGroups={serviceGroups}
        createAction={createProjectAction}
        searchClientsAction={searchActiveClientsAction}
        createClientAction={addClientAction}
      />
    </>
  );
}
