import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default async function GalleryCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadGalleryPage(workspaceId, projectId),
  ]);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects"),
      projectCrumb(workspaceId, projectId, page.project.title),
    ],
    current: GALLERY_COPY.pageTitle,
  });
  return <PageHeaderTrail items={items} />;
}
