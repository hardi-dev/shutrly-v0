import { getTranslations } from "next-intl/server";

import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
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

export default async function PicksCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const [verified, page] = await Promise.all([
    verifyOwnerWorkspace(workspaceId),
    loadSelectionGroups(workspaceId, projectId),
  ]);
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const galleryT = await getTranslations(GALLERY_COPY_NAMESPACE);
  const selectionT = await getTranslations(SELECTION_OWNER_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [
      sectionCrumb(workspaceId, "projects", t),
      projectCrumb(workspaceId, projectId, page.projectTitle),
      {
        label: galleryT("pageTitle"),
        href: `/w/${workspaceId}/projects/${projectId}/gallery`,
      },
    ],
    current: selectionT("cardTitle"),
  });
  return <PageHeaderTrail items={items} label={crumbT("breadcrumb")} />;
}
