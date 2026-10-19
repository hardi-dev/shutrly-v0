import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupScreen } from "@/features/gallery/ui/selection-group-screen/selection-group-screen";

export default async function SelectionGroupPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const detail = await loadSelectionGroupDetail(workspaceId, projectId, groupId);
  return (
    <>
      <SelectionGroupScreen
        workspaceId={workspaceId}
        projectId={projectId}
        detail={detail}
        lockAction={lockSelectionGroupAction}
      />
    </>
  );
}
