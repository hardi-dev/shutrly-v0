import { getTranslations } from "next-intl/server";

import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupScreen } from "@/features/gallery/ui/selection-group-screen/selection-group-screen";
import { groupStatusChip } from "@/features/gallery/ui/selection-owner-text/selection-owner-text";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

import { GROUP_PAGE_SELECTION_NAMESPACE } from "./page.copy";

export default async function SelectionGroupPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const selT = await getTranslations(GROUP_PAGE_SELECTION_NAMESPACE);
  const { workspaceId, projectId, groupId } = await params;
  const detail = await loadSelectionGroupDetail(workspaceId, projectId, groupId);
  return (
    <>
      <PageHeadingOverride
        title={detail.group.name}
        status={{ ...groupStatusChip(selT, detail.group.status), hasDot: true }}
        meta={selT("detailSubtitle")}
        parent={{
          label: selT("cardTitle"),
          href: `/w/${workspaceId}/projects/${projectId}/gallery/picks`,
        }}
        hidesBottomNav
      />
      <SelectionGroupScreen
        workspaceId={workspaceId}
        projectId={projectId}
        detail={detail}
        lockAction={lockSelectionGroupAction}
      />
    </>
  );
}
