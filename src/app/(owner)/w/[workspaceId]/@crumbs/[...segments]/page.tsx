import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function StaticCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; segments: string[] }> }>) {
  const { workspaceId, segments } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const items = staticOwnerTrail(segments, workspaceId, verified.workspace.name);
  return items ? <PageHeaderTrail items={items} /> : null;
}
