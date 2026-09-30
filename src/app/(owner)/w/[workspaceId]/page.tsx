import { enterWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { DashboardScreen } from "@/features/workspace/ui/dashboard-screen/dashboard-screen";

export default async function DashboardPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ state?: string }>;
}>) {
  const { workspaceId } = await params;
  const { state } = await searchParams;
  const { workspace } = await enterWorkspace(workspaceId);
  return (
    <DashboardScreen
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      created={state === "created"}
    />
  );
}
