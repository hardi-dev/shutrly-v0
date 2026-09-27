import { enterWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { DashboardScreen } from "@/features/workspace/ui/dashboard-screen/dashboard-screen";

export default async function DashboardPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { workspace } = await enterWorkspace(workspaceId);
  return <DashboardScreen workspaceId={workspaceId} workspaceName={workspace.name} />;
}
