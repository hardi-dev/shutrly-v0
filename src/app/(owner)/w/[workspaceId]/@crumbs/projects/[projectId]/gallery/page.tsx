import { getTranslations } from "next-intl/server";

import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import {
  ownerTrail,
  projectCrumb,
  sectionCrumb,
} from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import {
  GALLERY_COPY_NAMESPACE,
  OWNER_NAV_COPY_NAMESPACE,
  PAGE_HEADER_COPY_NAMESPACE,
} from "./page.copy";

export default async function GalleryCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadGalleryPage(workspaceId, projectId),
  ]);
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const galleryT = await getTranslations(GALLERY_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects", t),
      projectCrumb(workspaceId, projectId, page.project.title),
    ],
    current: galleryT("pageTitle"),
  });
  return <PageHeaderTrail items={items} label={crumbT("breadcrumb")} />;
}
