import { loadProjectDetail } from "@/composition/booking/project-flow/project-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function ProjectCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, project] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadProjectDetail(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "projects")],
    current: project.title,
  });
  return <PageHeaderTrail items={items} />;
}
