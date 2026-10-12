import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function PicksGroupCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const [verified, detail] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroupDetail(workspaceId, projectId, groupId),
  ]);
  const gallery = `/w/${workspaceId}/projects/${projectId}/gallery`;
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, detail.projectTitle),
      { label: GALLERY_COPY.pageTitle, href: gallery },
      { label: SELECTION_OWNER_COPY.cardTitle, href: `${gallery}/picks` },
    ],
    current: detail.group.name,
  });
  return <PageHeaderTrail items={items} />;
}
