import { getTranslations } from "next-intl/server";

import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupsScreen } from "@/features/gallery/ui/selection-groups-screen/selection-groups-screen";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

import { PICKS_PAGE_GALLERY_NAMESPACE, PICKS_PAGE_SELECTION_NAMESPACE } from "./page.copy";

export default async function SelectionGroupsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const selT = await getTranslations(PICKS_PAGE_SELECTION_NAMESPACE);
  const galT = await getTranslations(PICKS_PAGE_GALLERY_NAMESPACE);
  const { workspaceId, projectId } = await params;
  const page = await loadSelectionGroups(workspaceId, projectId);
  return (
    <>
      <PageHeadingOverride
        title={selT("cardTitle")}
        meta={selT("pageMeta")}
        parent={{
          label: galT("pageTitle"),
          href: `/w/${workspaceId}/projects/${projectId}/gallery`,
        }}
        hidesBottomNav
      />
      <SelectionGroupsScreen
        workspaceId={workspaceId}
        projectId={projectId}
        page={page}
        lockAction={lockSelectionGroupAction}
      />
    </>
  );
}
