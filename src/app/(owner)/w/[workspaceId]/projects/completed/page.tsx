import { PROJECT_MENU_ACTIONS } from "@/app/actions/booking/project-menu-actions";
import { loadMoreProjectsAction, searchFilterClientsAction } from "@/app/actions/booking/projects";
import { loadProjects } from "@/composition/booking/project-flow/project-flow";
import { ProjectsScreen } from "@/features/booking/ui/projects-screen/projects-screen";

export default async function CompletedProjectsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const { workspaceId } = await params;
  const query = await searchParams;
  const data = await loadProjects(workspaceId, "COMPLETED", query);
  return (
    <ProjectsScreen
      workspaceId={workspaceId}
      tab={data.tab}
      count={data.count}
      q={data.q}
      filter={data.filter}
      services={data.services}
      filterClient={data.filterClient}
      searchClientsAction={searchFilterClientsAction}
      menuActions={PROJECT_MENU_ACTIONS}
      initialPage={data.page}
      loadMoreAction={loadMoreProjectsAction}
    />
  );
}
