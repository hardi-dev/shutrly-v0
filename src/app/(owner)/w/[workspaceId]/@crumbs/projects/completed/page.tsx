import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

// Mirror: without it the dynamic slot `projects/[projectId]` would capture `completed`.
export default async function CompletedProjectsCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const items = staticOwnerTrail(["projects", "completed"], workspaceId, verified.workspace.name);
  return items ? <PageHeaderTrail items={items} /> : null;
}
