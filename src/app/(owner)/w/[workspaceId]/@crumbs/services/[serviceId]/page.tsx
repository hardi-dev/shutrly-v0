import { loadServiceDetail } from "@/composition/booking/catalog-flow/catalog-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function ServiceCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const [verified, service] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadServiceDetail(workspaceId, serviceId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "services")],
    current: service.name,
  });
  return <PageHeaderTrail items={items} />;
}
