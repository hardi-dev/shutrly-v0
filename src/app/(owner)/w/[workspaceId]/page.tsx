import { PROJECT_MENU_ACTIONS } from "@/app/actions/booking/project-menu-actions";
import { searchFilterClientsAction } from "@/app/actions/booking/projects";
import { loadDashboard } from "@/composition/workspace/dashboard-flow/dashboard-flow";
import { DashboardOverview } from "@/features/booking/ui/dashboard-overview/dashboard-overview";
import { DashboardScreen } from "@/features/workspace/ui/dashboard-screen/dashboard-screen";

export default async function DashboardPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>) {
  const { workspaceId } = await params;
  const query = await searchParams;
  const { workspace, checklist, overview } = await loadDashboard(workspaceId, query);
  return (
    <DashboardScreen
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      created={query.state === "created"}
      checklist={checklist}
      overview={
        overview === null ? null : (
          <DashboardOverview
            workspaceId={workspaceId}
            overview={overview.overview}
            services={overview.services}
            filterClient={overview.filterClient}
            menuActions={PROJECT_MENU_ACTIONS}
            searchClientsAction={searchFilterClientsAction}
          />
        )
      }
    />
  );
}
