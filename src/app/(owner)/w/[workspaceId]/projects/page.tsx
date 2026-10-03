import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { ComingSoonScreen } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen";

// Placeholder until F-07 Slice 3 builds the list: a static `projects/` folder stops `[section]`
// from matching `/projects`.
export default async function ProjectsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  await verifyOwnerWorkspace(workspaceId);
  return <ComingSoonScreen workspaceId={workspaceId} section="projects" />;
}
