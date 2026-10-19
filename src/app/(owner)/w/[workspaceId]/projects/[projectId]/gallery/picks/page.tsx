import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupsScreen } from "@/features/gallery/ui/selection-groups-screen/selection-groups-screen";

export default async function SelectionGroupsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const page = await loadSelectionGroups(workspaceId, projectId);
  return (
    <>
      <SelectionGroupsScreen
        workspaceId={workspaceId}
        projectId={projectId}
        page={page}
        lockAction={lockSelectionGroupAction}
      />
    </>
  );
}
