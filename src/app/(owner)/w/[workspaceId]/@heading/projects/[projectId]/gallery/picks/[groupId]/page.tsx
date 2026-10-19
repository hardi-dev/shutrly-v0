import { getTranslations } from "next-intl/server";

import { loadSelectionGroupDetail } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { groupStatusChip } from "@/features/gallery/ui/selection-owner-text/selection-owner-text";
import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { GROUP_PAGE_SELECTION_NAMESPACE } from "./page.copy";

export default async function SelectionGroupHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string; groupId: string }> }>) {
  const { workspaceId, projectId, groupId } = await params;
  const detail = await loadSelectionGroupDetail(workspaceId, projectId, groupId);
  const selT = await getTranslations(GROUP_PAGE_SELECTION_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <OwnerPageHeading
      title={detail.group.name}
      status={{ ...groupStatusChip(selT, detail.group.status), hasDot: true }}
      meta={selT("detailSubtitle")}
      parent={{
        label: selT("cardTitle"),
        href: `/w/${workspaceId}/projects/${projectId}/gallery/picks`,
      }}
      backLabel={backT("back")}
    />
  );
}
