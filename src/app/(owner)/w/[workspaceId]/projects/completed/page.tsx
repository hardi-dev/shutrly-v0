import { loadMoreProjectsAction } from "@/app/actions/booking/projects";
import { loadProjects } from "@/composition/booking/project-flow/project-flow";
import { ProjectsScreen } from "@/features/booking/ui/projects-screen/projects-screen";

export default async function CompletedProjectsPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ workspaceId: string }>; searchParams: Promise<{ q?: string }> }>) {
  const { workspaceId } = await params;
  const { q } = await searchParams;
  const data = await loadProjects(workspaceId, "COMPLETED", q);
  return (
    <ProjectsScreen
      workspaceId={workspaceId}
      tab={data.tab}
      count={data.count}
      q={data.q}
      initialPage={data.page}
      loadMoreAction={loadMoreProjectsAction}
    />
  );
}
