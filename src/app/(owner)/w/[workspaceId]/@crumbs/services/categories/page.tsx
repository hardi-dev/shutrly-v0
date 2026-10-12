import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

// Mirror: without it the dynamic slot `services/[serviceId]` would capture `categories`.
export default async function ServiceCategoriesCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const items = staticOwnerTrail(["services", "categories"], workspaceId, verified.workspace.name);
  return items ? <PageHeaderTrail items={items} /> : null;
}
