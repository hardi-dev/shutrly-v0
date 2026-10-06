import { lockSelectionGroupAction } from "@/app/actions/gallery/selection";
import { loadSelectionGroups } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { SelectionGroupsScreen } from "@/features/gallery/ui/selection-groups-screen/selection-groups-screen";
import { SELECTION_OWNER_COPY } from "@/features/gallery/ui/selection-owner-text/selection-owner.copy";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function SelectionGroupsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const page = await loadSelectionGroups(workspaceId, projectId);
  return (
    <>
      <PageHeadingOverride
        title={SELECTION_OWNER_COPY.cardTitle}
        meta={SELECTION_OWNER_COPY.pageMeta}
        parent={{ label: page.projectTitle, href: `/w/${workspaceId}/projects/${projectId}` }}
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
