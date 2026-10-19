import { getTranslations } from "next-intl/server";

import {
  deliveredMetaOf,
  headerMetaText,
} from "@/app/(owner)/w/[workspaceId]/projects/[projectId]/project-heading";
import { loadProjectDetail } from "@/composition/booking/project-flow/project-flow";
import { loadDeliveryCard } from "@/composition/gallery/delivery-flow/delivery-flow";
import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import { projectStatusChip } from "@/features/booking/ui/project-status-chip/project-status-props";
import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { PROJECT_DETAIL_PAGE_COPY_NAMESPACE } from "./page.copy";

export default async function ProjectDetailHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const locale = await getRequestFormattingLocale();
  const [project, delivery] = await Promise.all([
    loadProjectDetail(workspaceId, projectId),
    loadDeliveryCard(workspaceId, projectId),
  ]);
  const t = await getTranslations(PROJECT_DETAIL_PAGE_COPY_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  const deliveredMeta = await deliveredMetaOf(delivery, locale);
  return (
    <OwnerPageHeading
      title={project.title}
      status={projectStatusChip(t, project.status)}
      meta={headerMetaText(t, project, deliveredMeta, locale)}
      parent={{ label: t("parentLabel"), href: `/w/${workspaceId}/projects` }}
      backLabel={backT("back")}
    />
  );
}
