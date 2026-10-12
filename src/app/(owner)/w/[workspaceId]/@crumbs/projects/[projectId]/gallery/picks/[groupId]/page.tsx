import { getTranslations } from "next-intl/server";

import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
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
  SELECTION_OWNER_COPY_NAMESPACE,
} from "./page.copy";

export default async function PicksGroupCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const [verified, detail] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroupDetail(workspaceId, projectId, groupId),
  ]);
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const galleryT = await getTranslations(GALLERY_COPY_NAMESPACE);
  const selectionT = await getTranslations(SELECTION_OWNER_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  const galleryPath = `/w/${workspaceId}/projects/${projectId}/gallery`;
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects", t),
      projectCrumb(workspaceId, projectId, detail.projectTitle),
      { label: galleryT("pageTitle"), href: galleryPath },
      { label: selectionT("cardTitle"), href: `${galleryPath}/picks` },
    ],
    current: detail.group.name,
  });
  return <PageHeaderTrail items={items} label={crumbT("breadcrumb")} />;
}
