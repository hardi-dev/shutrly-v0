import { getTranslations } from "next-intl/server";

import { loadServiceDetail } from "@/composition/booking/catalog-flow/catalog-flow";
import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { SERVICE_DETAIL_PAGE_COPY_NAMESPACE } from "./page.copy";

export default async function ServiceDetailHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const service = await loadServiceDetail(workspaceId, serviceId);
  const t = await getTranslations(SERVICE_DETAIL_PAGE_COPY_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <OwnerPageHeading
      title={service.name}
      subtitle={t("serviceDetailSubtitle")}
      parent={{ label: t("tabServices"), href: `/w/${workspaceId}/services` }}
      backLabel={backT("back")}
    />
  );
}
