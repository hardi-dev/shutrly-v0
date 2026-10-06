import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupScreen } from "@/features/gallery/ui/selection-group-screen/selection-group-screen";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import { groupStatusChip } from "@/features/gallery/ui/selection-owner-text/selection-owner-text";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function SelectionGroupPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const detail = await loadSelectionGroupDetail(workspaceId, projectId, groupId);
  return (
    <>
      <PageHeadingOverride
        title={detail.group.name}
        status={{ ...groupStatusChip(detail.group.status), hasDot: true }}
        meta={SELECTION_OWNER_COPY.detailSubtitle}
        parent={{
          label: SELECTION_OWNER_COPY.cardTitle,
          href: `/w/${workspaceId}/projects/${projectId}/pilihan`,
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
