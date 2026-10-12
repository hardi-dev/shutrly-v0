import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function PicksCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroups(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, page.projectTitle),
      {
        label: GALLERY_COPY.pageTitle,
        href: `/w/${workspaceId}/projects/${projectId}/gallery`,
      },
    ],
    current: SELECTION_OWNER_COPY.cardTitle,
  });
  return <PageHeaderTrail items={items} />;
}
