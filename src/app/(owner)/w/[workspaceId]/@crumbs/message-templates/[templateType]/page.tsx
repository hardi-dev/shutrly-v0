import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function TemplateCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; templateType: string }> }>) {
  const { workspaceId, templateType } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const path = `/w/${workspaceId}/message-templates/${templateType}`;
  const page = messageTemplateSubPages(workspaceId).find((subPage) => subPage.path === path);
  if (!page) return null;
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "message-templates")],
    current: page.title,
  });
  return <PageHeaderTrail items={items} />;
}
